const https = require('https');

const API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido. Usa POST." }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const texto = body.texto;

    if (!texto) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Falta el campo 'texto' en el JSON." }),
      };
    }

    // Promesa para manejar la petición HTTPS nativa de Node.js sin usar 'fetch'
    const queryHuggingFace = (data) => {
      return new Promise((resolve, reject) => {
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'NetlifyFunction-Vectorizar'
          },
          timeout: 30000 // 30 segundos de margen
        };

        const req = https.request(API_URL, options, (res) => {
          let responseData = '';
          res.on('data', (chunk) => { responseData += chunk; });
          res.on('end', () => { resolve(JSON.parse(responseData)); });
        });

        req.on('error', (err) => { reject(err); });
        req.on('timeout', () => { req.destroy(); reject(new Error('Tiempo de espera agotado con Hugging Face')); });
        
        req.write(JSON.stringify({ inputs: data }));
        req.end();
      });
    };

    // Ejecutar la petición
    const embedding = await queryHuggingFace(texto);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        texto_original: texto,
        dimensiones: Array.isArray(embedding) ? embedding.length : null,
        vector: embedding,
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
