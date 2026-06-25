const API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

exports.handler = async (event, context) => {
  // Validar que sea un método POST
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

    // Llamada limpia a Hugging Face usando el fetch nativo de Node.js
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: texto }),
    });

    const embedding = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // CORS libre
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