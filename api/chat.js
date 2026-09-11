export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

    if (!apiKey) {
        return res.status(200).json({ reply: "Falta configurar GEMINI_API_KEY en Vercel." });
    }

    const systemInstruction = `Eres PolyTortu, la sabia, simpática y atenta tortuga politécnica de la ESPOL (asistente oficial de "Objetos ESPOL" en el campus Gustavo Galindo).
Tu personalidad es amable, universitaria y servicial. Usa algún emoji como 🐢 o 💙.
Contexto: Hay un reporte de una "Cartuchera negra" hallada en FCSH hace 10 minutos, bajo custodia en la garita principal de FCSH.
Si el usuario confirma que es suya, indícale acudir a la garita con carné o cédula.
Horario garitas: 07:30 a 19:30 de lunes a viernes.
Responde breve (2 o 3 oraciones).`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [
                        { text: `${systemInstruction}\n\nPregunta del estudiante: "${prompt}"\nResponde como PolyTortu:` }
                    ]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ reply: `Aviso Gemini: ${data.error.message}` });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No obtuve respuesta de Gemini.";
        return res.status(200).json({ reply });
    } catch (error) {
        return res.status(200).json({ reply: `Error de servidor: ${error.message}` });
    }
}
