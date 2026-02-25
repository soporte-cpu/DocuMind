import os
from pathlib import Path
try:
    import docx
except ImportError:
    docx = None

def search_in_docx_recursive(folder):
    if not docx: return
    for path in Path(folder).rglob("*.docx"):
        try:
            doc = docx.Document(str(path))
            text = "\n".join(p.text for p in doc.paragraphs)
            if "pospac" in text.lower():
                print(f"ENCONTRADO en: {path.relative_to(folder)}")
        except Exception: pass

if __name__ == "__main__":
    search_in_docx_recursive("docs")
