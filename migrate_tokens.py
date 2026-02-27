import sqlite3

def update_db():
    conn = sqlite3.connect('documind.db')
    cursor = conn.cursor()
    
    # Agregar columnas de tokens a la tabla messages
    columns = [
        ("prompt_tokens", "INTEGER DEFAULT 0"),
        ("completion_tokens", "INTEGER DEFAULT 0")
    ]
    
    for col_name, col_type in columns:
        try:
            cursor.execute(f"ALTER TABLE messages ADD COLUMN {col_name} {col_type}")
            print(f"Columna '{col_name}' añadida con éxito.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print(f"La columna '{col_name}' ya existe.")
            else:
                print(f"Error al añadir '{col_name}': {e}")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    update_db()
