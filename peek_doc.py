import docx
doc = docx.Document("docs/I-TOP-11 (Apoyo Laser).docx")
for p in doc.paragraphs:
    if "pospac" in p.text.lower():
        print(p.text)
