import os
import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from .ingest_utils import update_vector_store, get_vector_store, get_hybrid_retriever, DOCS_DIR
from .database import engine, get_db
from . import models, auth
from sqlalchemy.orm import Session
from fastapi import Depends, Form
from fastapi.security import OAuth2PasswordRequestForm
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from dotenv import load_dotenv

# Crear tablas al iniciar
models.Base.metadata.create_all(bind=engine)

# Crear usuario admin inicial si no existe
def create_initial_admin():
    db = next(get_db())
    if db.query(models.User).count() == 0:
        print("[AUTH] Creando usuario administrador inicial (admin/admin)")
        hashed_pwd = auth.get_password_hash("admin")
        admin_user = models.User(username="admin", hashed_password=hashed_pwd, role="admin")
        db.add(admin_user)
        db.commit()

create_initial_admin()

load_dotenv()

app = FastAPI(title="RAG App API")

# Estado global de indexación
is_indexing = False

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Almacenamiento simple de sesiones en memoria
sessions_history: Dict[str, List] = {}

class QueryRequest(BaseModel):
    prompt: str
    session_id: Optional[str] = "default"
    area: Optional[str] = None # Filtro por área temática

class SourceDetail(BaseModel):
    name: str
    content: str

class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceDetail]

class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = "viewer"
    is_active: Optional[int] = 1

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None # Solo si se quiere cambiar
    role: Optional[str] = None
    is_active: Optional[int] = None

@app.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    hashed_pwd = auth.get_password_hash(user_data.password)
    new_user = models.User(
        username=user_data.username, 
        hashed_password=hashed_pwd,
        role=user_data.role if user_data.role in ["admin", "viewer"] else "viewer"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth.create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me")
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return {"username": current_user.username, "role": current_user.role}

# --- GESTIÓN DE USUARIOS (ADMIN ONLY) ---

@app.get("/users")
async def list_users(db: Session = Depends(get_db), admin: models.User = Depends(auth.check_admin_role)):
    users = db.query(models.User).all()
    return [{
        "id": u.id, 
        "username": u.username, 
        "full_name": u.full_name,
        "email": u.email,
        "role": u.role, 
        "is_active": u.is_active,
        "created_at": u.created_at
    } for u in users]

@app.post("/users")
async def admin_create_user(user_data: UserCreate, db: Session = Depends(get_db), admin: models.User = Depends(auth.check_admin_role)):
    db_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    hashed_pwd = auth.get_password_hash(user_data.password)
    new_user = models.User(
        username=user_data.username, 
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hashed_pwd,
        role=user_data.role if user_data.role in ["admin", "viewer"] else "viewer",
        is_active=user_data.is_active
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "created", "username": new_user.username}

@app.patch("/users/{user_id}")
async def admin_update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db), admin: models.User = Depends(auth.check_admin_role)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if user_data.full_name is not None: user.full_name = user_data.full_name
    if user_data.email is not None: user.email = user_data.email
    if user_data.role is not None: user.role = user_data.role
    if user_data.is_active is not None: user.is_active = user_data.is_active
    
    if user_data.password:
        user.hashed_password = auth.get_password_hash(user_data.password)
        
    db.commit()
    return {"status": "updated"}

@app.delete("/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db), admin: models.User = Depends(auth.check_admin_role)):
    if admin.id == user_id:
        raise HTTPException(status_code=400, detail="No puedes borrarte a ti mismo")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    db.delete(user)
    db.commit()
    return {"status": "deleted"}


@app.post("/chat", response_model=QueryResponse)
async def chat(request: QueryRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    try:
        # Cargar retriever con filtro de área si existe
        retriever = get_hybrid_retriever(area=request.area)
        if not retriever:
            raise HTTPException(status_code=400, detail="No hay documentos indexados. Por favor sube uno primero.")
        
        # 1. Gestionar Historial Persistente (Base de Datos)
        chat_db = db.query(models.ChatTurn).filter(models.ChatTurn.session_id == request.session_id).first()
        if not chat_db:
            # Generar un título profesional corto con el LLM para la primera pregunta
            llm_title = ChatOpenAI(model_name="gpt-4o", temperature=0)
            title_prompt = f"Genera un título muy corto (máximo 4 palabras) para esta consulta: {request.prompt}"
            try:
                chat_title = llm_title.invoke([HumanMessage(content=title_prompt)]).content.replace('"', '')
            except:
                chat_title = request.prompt[:50]
                
            chat_db = models.ChatTurn(
                session_id=request.session_id, 
                area_id=None, 
                title=chat_title,
                user_id=current_user.id
            )
            db.add(chat_db)
            db.commit()
            db.refresh(chat_db)
        
        # Cargar mensajes previos
        db_messages = db.query(models.Message).filter(models.Message.chat_id == chat_db.id).order_by(models.Message.created_at.asc()).all()
        history: List[BaseMessage] = []
        for msg in db_messages:
            if msg.role == "user":
                history.append(HumanMessage(content=msg.content))
            else:
                history.append(AIMessage(content=msg.content))

        print(f"[CHAT] Sesión: {request.session_id} | Área: {request.area or 'Todas'}")
        
        llm = ChatOpenAI(model_name="gpt-4o", temperature=0)
        
        # 2. CONTEXTUALIZACIÓN
        standalone_question = request.prompt
        if history:
            contextualize_q_system_prompt = """Dada una conversación y la última pregunta del usuario, 
            si la pregunta hace referencia a algo del historial (ej: "paso 5", "quien es él"), 
            reformúlala para que sea una pregunta independiente. NO la respondas, solo reformúlala."""
            
            contextualize_q_prompt = ChatPromptTemplate.from_messages([
                ("system", contextualize_q_system_prompt),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ])
            
            contextualize_chain = contextualize_q_prompt | llm | StrOutputParser()
            standalone_question = contextualize_chain.invoke({
                "chat_history": history[-5:],
                "input": request.prompt
            })

        # 3. RECUPERACIÓN HÍBRIDA
        docs = retriever.invoke(standalone_question)
        context_text = "\n\n".join(doc.page_content for doc in docs)
        
        # DEBUG: Ver qué está leyendo la IA
        print(f"[DEBUG] Chunks recuperados: {len(docs)}")
        for i, d in enumerate(docs):
            source = d.metadata.get('source', 'Desconocido')
            print(f"   [{i+1}] {source} | Contenido: {d.page_content[:100]}...")
        
        # 4. GENERACIÓN DE RESPUESTA (STRICT & TECHNICAL)
        template = """Eres DocuMind Enterprise, un asistente de auditoría técnica experto. 
        Tu misión es responder consultas basándote en el CONTEXTO proporcionado.

        NORMAS DE RESPUESTA:
        1. Responde de forma precisa y profesional.
        2. Si la información NO está clara en el CONTEXTO, indícalo educadamente: "No he encontrado información específica sobre [tema] en los documentos actuales."
        3. Si mencionas datos técnicos (números, unidades, parámetros), cítalos TAL CUAL aparecen en el texto.
        4. Relaciona conceptos si el contexto lo permite (ej: si el usuario pregunta por LIDAR y el documento habla de Parámetros Láser en un estudio LIDAR, úsalos).
        5. Mantén un tono ejecutivo: directo y bien estructurado.

        Área: {area_name}

        CONTEXTO DE REFERENCIA:
        {context}

        HISTORIAL DE CONVERSACIÓN:
        {history}

        CONSULTA DEL USUARIO: {question}

        RESPUESTA TÉCNICA:"""
        
        prompt = ChatPromptTemplate.from_template(template)
        history_str = "\n".join([f"{'Usuario' if isinstance(m, HumanMessage) else 'IA'}: {m.content}" for m in history[-6:]])
        
        chain = prompt | llm | StrOutputParser()
        answer = chain.invoke({
            "area_name": request.area or "General",
            "context": context_text, 
            "history": history_str,
            "question": request.prompt
        })
        
        # 5. Guardar en Base de Datos
        user_msg = models.Message(chat_id=chat_db.id, role="user", content=request.prompt)
        assistant_msg = models.Message(chat_id=chat_db.id, role="assistant", content=answer)
        db.add(user_msg)
        db.add(assistant_msg)
        db.commit()
        
        # 6. Recolectar fuentes con contenido para Citas Verificables (Filtradas por Relevancia)
        source_details = []
        unique_sources = {} # {filename: content_summary}
        
        # Palabras clave de la respuesta para un filtro rápido
        answer_lower = answer.lower()
        
        for doc in docs:
            snippet = doc.page_content.strip()
            filename = doc.metadata.get("source", "Desconocido")
            
            # Filtro de Relevancia: ¿El snippet aporta algo a la respuesta?
            # Comprobamos si palabras importantes del snippet están en la respuesta
            snippet_words = set(snippet.lower().split())
            query_words = set(standalone_question.lower().split())
            
            # Si el snippet contiene términos clave de la pregunta Y algo de su texto está en la respuesta, es relevante
            is_relevant = any(word in answer_lower for word in snippet_words if len(word) > 4)
            
            if is_relevant:
                if filename not in unique_sources:
                    unique_sources[filename] = snippet
                else:
                    # Si ya existe, acumulamos un poco más de contexto si no es repetido
                    if snippet[:50] not in unique_sources[filename]:
                        unique_sources[filename] += "\n\n[...]\n\n" + snippet
        
        for name, content in unique_sources.items():
            source_details.append(SourceDetail(name=name, content=content))
                
        return QueryResponse(answer=answer, sources=source_details)
    except Exception as e:
        print(f"[ERROR CHAT] Ocurrió un fallo: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/areas")
async def list_areas(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """Lista las áreas desde la DB, sincronizando con carpetas físicas."""
    try:
        db_areas = db.query(models.Area).all()
        if not DOCS_DIR.exists(): 
            DOCS_DIR.mkdir(parents=True, exist_ok=True)
        
        physical_folders = [d.name for d in DOCS_DIR.iterdir() if d.is_dir()]
        
        changed = False
        for folder in physical_folders:
            if not any(a.name == folder for a in db_areas):
                new_area = models.Area(name=folder, icon="📁")
                db.add(new_area)
                changed = True
        
        if changed:
            db.commit()
            db_areas = db.query(models.Area).all()
            
        return [{"id": a.id, "name": a.name, "icon": a.icon, "description": a.description} for a in db_areas]
    except Exception as e:
        print(f"[ERROR AREAS] {str(e)}")
        db.rollback()
        # Si hay error, al menos devolvemos lo que hay en DB sin sincronizar
        db_areas = db.query(models.Area).all()
        return [{"id": a.id, "name": a.name, "icon": a.icon, "description": a.description} for a in db_areas]

@app.post("/areas")
async def create_area(name: str, icon: str = "📁", db: Session = Depends(get_db), admin_user: models.User = Depends(auth.check_admin_role)):
    area_path = DOCS_DIR / name
    if area_path.exists():
        raise HTTPException(status_code=400, detail="El nombre de carpeta ya existe")
    
    area_path.mkdir(parents=True, exist_ok=True)
    new_area = models.Area(name=name, icon=icon)
    db.add(new_area)
    db.commit()
    db.refresh(new_area)
    return new_area

@app.patch("/areas/{area_id}")
async def update_area(area_id: int, name: Optional[str] = None, icon: Optional[str] = None, db: Session = Depends(get_db), admin_user: models.User = Depends(auth.check_admin_role)):
    area = db.query(models.Area).filter(models.Area.id == area_id).first()
    if not area: raise HTTPException(status_code=404)
    
    if name and name != area.name:
        old_path = DOCS_DIR / area.name
        new_path = DOCS_DIR / name
        if old_path.exists():
            os.rename(old_path, new_path)
        area.name = name
        
    if icon:
        area.icon = icon
        
    db.commit()
    db.refresh(area)
    update_vector_store()
    return area

@app.delete("/areas/{area_id}")
async def delete_area(area_id: int, db: Session = Depends(get_db), admin_user: models.User = Depends(auth.check_admin_role)):
    area = db.query(models.Area).filter(models.Area.id == area_id).first()
    if not area: raise HTTPException(status_code=404)
    
    area_path = DOCS_DIR / area.name
    if area_path.exists():
        shutil.rmtree(area_path)
    
    db.delete(area)
    db.commit()
    update_vector_store()
    return {"status": "deleted"}

@app.get("/history")
async def get_all_history(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """Obtiene la lista de conversaciones guardadas filtradas por el usuario actual."""
    query = db.query(models.ChatTurn)
    # Si no es admin, solo ve lo suyo
    if current_user.role != "admin":
        query = query.filter(models.ChatTurn.user_id == current_user.id)
        
    chats = query.order_by(models.ChatTurn.created_at.desc()).all()
    return [{"session_id": c.session_id, "title": c.title, "area": c.area.name if c.area else "General"} for c in chats]

@app.get("/history/{session_id}")
async def get_chat_messages(session_id: str, db: Session = Depends(get_db)):
    """Obtiene los mensajes de una conversación específica."""
    chat_db = db.query(models.ChatTurn).filter(models.ChatTurn.session_id == session_id).first()
    if not chat_db:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    messages = db.query(models.Message).filter(models.Message.chat_id == chat_db.id).order_by(models.Message.created_at.asc()).all()
    return [{"role": m.role, "content": m.content} for m in messages]

@app.delete("/history/{session_id}")
async def delete_chat_session(session_id: str, db: Session = Depends(get_db)):
    """Elimina una sesión de chat y todos sus mensajes."""
    chat_db = db.query(models.ChatTurn).filter(models.ChatTurn.session_id == session_id).first()
    if not chat_db:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    #sqlalchemy cascade debería borrar los mensajes, pero nos aseguramos
    db.query(models.Message).filter(models.Message.chat_id == chat_db.id).delete()
    db.delete(chat_db)
    db.commit()
    return {"status": "deleted"}

@app.get("/files")
async def list_files():
    files = []
    if not DOCS_DIR.exists(): return []
    
    # Función recursiva para listar archivos preservando rutas relativas
    def scan_recursive(directory, area_name):
        for item in directory.iterdir():
            if item.is_file():
                # Obtener la ruta relativa desde el directorio del área
                rel_path = item.relative_to(directory if area_name == "General" else DOCS_DIR / area_name)
                files.append({"name": str(rel_path).replace("\\", "/"), "area": area_name})
            elif item.is_dir():
                scan_recursive(item, area_name)

    # Archivos en raíz (General)
    for f in DOCS_DIR.iterdir():
        if f.is_file():
            files.append({"name": f.name, "area": "General"})
            
    # Archivos en áreas (carpetas de primer nivel)
    for d in DOCS_DIR.iterdir():
        if d.is_dir():
            scan_recursive(d, d.name)
            
    return files

@app.delete("/files/{area}/{filename:path}")
async def delete_file(area: str, filename: str, admin_user: models.User = Depends(auth.check_admin_role)):
    """Elimina un archivo específico de un área (soporta rutas)."""
    if area == "General":
        file_path = DOCS_DIR / filename
    else:
        file_path = DOCS_DIR / area / filename
    
    if file_path.exists():
        file_path.unlink()
        # Limpiar carpetas vacías si es necesario (opcional)
        update_vector_store()
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Archivo no encontrado")

@app.get("/indexing-status")
async def get_indexing_status():
    return {"is_indexing": is_indexing}

def wrap_update_vector_store():
    global is_indexing
    is_indexing = True
    try:
        update_vector_store()
    finally:
        is_indexing = False

@app.post("/upload")
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...), area: Optional[str] = None, subfolder: Optional[str] = None, admin_user: models.User = Depends(auth.check_admin_role)):
    target_dir = DOCS_DIR
    if area and area != "General":
        target_dir = DOCS_DIR / area
    
    if subfolder:
        target_dir = target_dir / subfolder
        
    target_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = target_dir / file.filename
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Ejecutar indexación en segundo plano
    background_tasks.add_task(wrap_update_vector_store)
    
    return {"filename": file.filename, "status": "uploaded", "index_status": "queued"}

@app.post("/reprocess")
async def reprocess_docs(background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.check_admin_role)):
    """Borra el índice actual y reprocesa todos los documentos físicamente."""
    global is_indexing
    if is_indexing:
        raise HTTPException(status_code=400, detail="Ya se está realizando una indexación.")
    
    is_indexing = True
    
    def run_reprocess():
        global is_indexing
        try:
            update_vector_store(force_reprocess=True)
        finally:
            is_indexing = False
            
    background_tasks.add_task(run_reprocess)
    return {"message": "Reprocesamiento total iniciado en segundo plano."}

# Rutas para el Frontend
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

@app.get("/")
async def read_index():
    return FileResponse(FRONTEND_DIR / "index.html")

# Servir archivos estáticos (CSS, JS, Imágenes)
app.mount("/", StaticFiles(directory=FRONTEND_DIR), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
