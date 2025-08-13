import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_KEY;
if (!OPENAI_KEY) {
  console.error("❌ OPENAI_KEY missing");
  process.exit(1);
}

app.post("/chat", async (req, res) => {
  try {
    const { message = "", tone = "friendly", playerName = "", tribe = "neutral", context = "" } = req.body || {};

    const systemPrompt = `You are a friendly NPC in a Roblox game.
Respond briefly and in character. Context: ${context}`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    });

    const data = await aiResponse.json();
    console.log("🔹 OpenAI raw response:", JSON.stringify(data, null, 2));

    let reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      if (data?.error?.message) {
        reply = `Error: ${data.error.message}`;
      } else {
        reply = "...";
      }
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ reply: "Server error" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ AI server running on port ${PORT}`);
});
