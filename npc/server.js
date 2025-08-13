import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const OPENAI_KEY = process.env.OPENAI_KEY;
if (!OPENAI_KEY) {
  console.error("OPENAI_KEY missing");
  process.exit(1);
}

app.post("/chat", async (req, res) => {
  try {
    const { message = "", tone = "friendly", playerName = "", tribe = "", context = "" } = req.body || {};
    const isRude = ["rude", "hostile"].includes(tone) || ["rock", "black"].includes(String(tribe).toLowerCase());
    const systemPrompt = [
      `You are an NPC in a Roblox game. Keep replies short (max 1–2 sentences).`,
      `Persona: ${isRude ? "snarky, rude, distrustful" : "warm, welcoming, helpful"}.`,
      playerName ? `The player is named ${playerName}.` : ``,
      tribe ? `The player's tribe is ${tribe}.` : ``,
      context ? `Context: ${context}` : ``
    ].filter(Boolean).join("\n");

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: isRude ? 0.9 : 0.7,
        max_tokens: 80,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "…";
    res.status(200).json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ reply: "I can't talk right now." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI server on :${PORT}`);
});
