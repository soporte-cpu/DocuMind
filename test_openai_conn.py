import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()

try:
    response = client.chat.completions.create(
      model="gpt-4o",
      messages=[{"role": "user", "content": "Hola, esto es una prueba de conexión."}],
      max_tokens=10
    )
    print("SUCCESS:", response.choices[0].message.content)
except Exception as e:
    print("FAILURE:", str(e))
