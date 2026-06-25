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

    // Importación dinámica de la librería de Transformers de Hugging Face
    const { pipeline } = await import('@xenova/transformers');

    // Inicializamos el extractor de características con el modelo ligero
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    // Generamos la vectorización (embedding)
    const output = await extractor(texto, { pooling: 'mean', normalize: true });
    
    // Convertimos el resultado a un array común de JavaScript
    const embedding = Array.from(output.data);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        texto_original: texto,
        dimensiones: embedding.length,
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
