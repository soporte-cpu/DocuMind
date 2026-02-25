# Usa una imagen base de Python oficial estable
FROM python:3.10-slim

# Configuraciones para optimizar Python en Docker
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Instala dependencias del sistema necesarias (build-essential para faiss-cpu y otros)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Copia el archivo de requerimientos e instala las librerías
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo el contenido del proyecto al contenedor
COPY . .

# Asegura que los directorios de datos existan
RUN mkdir -p docs embeddings transcripts

# Expone el puerto 8000 para FastAPI
EXPOSE 8000

# Comando de inicio
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
