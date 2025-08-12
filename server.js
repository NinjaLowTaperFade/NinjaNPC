import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const app = express();
app.use(bodyParser.json());

const OPENAI_KEY = process.env.OPENAI_KEY; // Loaded from .env file

if (!OPENAI_KEY) {
    console.error("❌ ERROR: No OpenAI API key found. Please set OPENAI_KEY in your .env file.");
    process.exit(1);
}

app.post("/chat", async (req, res) => {
    const { message, tone } = req.body;

    const systemPrompt = `You are an NPC in a Roblox game.
You are ${tone === "rude" ? "hostile and rude" : "friendly and welcoming"}.
Keep responses short and in character.`;

    try {
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_KEY}`
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
        res.json({ reply: data.choices[0].message.content.trim() });

    } catch (err) {
        console.error("AI request failed:", err);
        res.status(500).json({ reply: "Sorry, I couldn't think of a response." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ AI Server running on port ${PORT}`));
