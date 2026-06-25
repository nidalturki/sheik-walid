import json
import urllib.request

# Modelo gratuito de Hugging Face (no necesitas pagar nada)
API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"

# NOTA: Hugging Face ofrece una capa gratuita pública. 
# Si haces demasiadas peticiones seguidas, te conviene crear un Token gratis en su web 
# y ponerlo en las variables de entorno de Netlify como HF_TOKEN.
import os
HF_TOKEN = os.environ.get("HF_TOKEN", "") 

def handler(event, context):
    if event.get("httpMethod") != "POST":
        return {
            "statusCode": 405,
            "body": json.dumps({"error": "Método no permitido. Usa POST."})
        }
    
    try:
        body = json.loads(event.get("body", "{}"))
        texto = body.get("texto")
        
        if not texto:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Falta el campo 'texto'."})
            }
        
        # Preparar la petición a Hugging Face
        payload = json.dumps({"inputs": texto}).encode("utf-8")
        headers = {"Content-Type": "application/json"}
        if HF_TOKEN:
            headers["Authorization"] = f"Bearer {HF_TOKEN}"
            
        req = urllib.request.Request(API_URL, data=payload, headers=headers)
        
        # Enviar y recibir la respuesta
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            embedding = json.loads(res_body)
            
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "texto_original": texto,
                "dimensiones": len(embedding) if isinstance(embedding, list) else None,
                "vector": embedding
            })
        }
        
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }