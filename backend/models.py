from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from .database import Base
import datetime
import enum

class UserRole(enum.Enum):
    ADMIN = "admin"
    VIEWER = "viewer"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String)
    role = Column(String, default="viewer") # admin o viewer
    is_active = Column(Integer, default=1) # 1: Activo, 0: Inactivo
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    chats = relationship("ChatTurn", back_populates="user")

class Area(Base):
    __tablename__ = "areas"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    icon = Column(String, default="📁") # Emojis o strings de iconos
    
    documents = relationship("Document", back_populates="area")
    chats = relationship("ChatTurn", back_populates="area")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"))
    status = Column(String, default="indexed")
    
    area = relationship("Area", back_populates="documents")

class ChatTurn(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True) # ID único de la conversación
    title = Column(String, default="Nueva Conversación")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Asociado al usuario
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="chats")
    area = relationship("Area", back_populates="chats")
    messages = relationship("Message", back_populates="chat")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"))
    role = Column(String) # user o assistant
    content = Column(Text)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    chat = relationship("ChatTurn", back_populates="messages")
