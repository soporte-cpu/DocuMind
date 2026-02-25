import os
from pathlib import Path
try:
    import docx
except ImportError:
    docx = None

def search_in_docx(folder):
    if not docx:
        print("python-docx no instalado")
        return
    
    for path in Path(folder).glob("*.docx"):
        try:
            doc = docx.Document(str(path))
            text = "\n".join(p.text for p in doc.paragraphs)
            if "pospac" in text.lower():
                print(f"ENCONTRADO en: {path.name}")
            else:
                # print(f"No encontrado en: {path.name}")
                pass
        except Exception as e:
            print(f"Error leyendo {path.name}: {e}")

if __name__ == "__main__":
    search_in_docx("docs")
