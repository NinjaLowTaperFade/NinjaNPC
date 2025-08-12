export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST requests allowed" });
    }

    const { message, tone } = req.body;

    const systemPrompt = `You are an NPC in a Roblox game.
You are ${tone === "rude" ? "hostile and rude" : "friendly and welcoming"}.
Keep responses short and in character.`;

    try {
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                max_tokens: 50
            })
        });

        const data = await aiResponse.json();
        return res.status(200).json({ reply: data.choices[0].message.content.trim() });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ reply: "Error talking to AI" });
    }
}
