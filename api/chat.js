export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Falta la API Key en el servidor' });
    }

    const systemInstruction = `Eres PolyTortu, la sabia, simpática y atenta tortuga politécnica de la ESPOL (asistente oficial de "Objetos ESPOL" en el campus Gustavo Galindo).
Tu tono es educado, universitario, juvenil y con esencia politécnica. Usas emojis como 🐢 o 💙.
Contexto: Hay un reporte de una "Cartuchera negra" hallada en FCSH hace 10 minutos, bajo custodia en la garita de FCSH.
Si el usuario confirma que es suya, indícale acercarse a la garita con su carné o cédula.
Horario de garitas: 07:30 a 19:30 de lunes a viernes.
Responde de forma concisa (máximo 2 a 3 oraciones) a cualquier pregunta o saludo.`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [
                        { text: systemInstruction },
                        { text: `Mensaje del estudiante: "${prompt}". Responde como PolyTortu:` }
                    ]
                }]
            })
        });

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude procesar la respuesta.";
        return res.status(200).json({ reply });
    } catch (error) {
        return res.status(500).json({ error: 'Error al contactar con Gemini' });
    }
}
