import sqlite3
import os

db_path = r'c:\Users\Administrator\.gemini\antigravity\scratch\RAG-app\documind.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE areas ADD COLUMN icon VARCHAR DEFAULT '📁'")
        print("Column 'icon' added to 'areas' table.")
    except sqlite3.OperationalError:
        print("Column 'icon' already exists or other error.")
    conn.commit()
    conn.close()
else:
    print(f"Database not found at {db_path}")
