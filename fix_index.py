from backend.ingest_utils import update_vector_store
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    print("--- Iniciando Re-indexación Manual ---")
    if not os.getenv("OPENAI_API_KEY"):
        print("ERROR: No se encontró OPENAI_API_KEY en el archivo .env")
    else:
        try:
            update_vector_store()
            print("--- Proceso Finalizado ---")
        except Exception as e:
            print(f"Ocurrió un error: {e}")
