import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const apiKey = process.env.OPENAI_API_KEY;
const ai = apiKey ? new OpenAI({ apiKey }) : null;

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    assistant: "J.A.R.V.I.S.",
    aiConfigured: Boolean(ai)
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = typeof req.body?.message === "string"
      ? req.body.message.trim()
      : "";

    if (!message) {
      return res.status(400).json({ error: "Please enter a message." });
    }

    if (message.length > 8000) {
      return res.status(413).json({ error: "Message is too long. Please shorten it." });
    }

    if (!ai) {
      return res.status(503).json({
        error: "The AI service is not configured yet. Add your API key to the server's private .env file."
      });
    }

    const completion = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are J.A.R.V.I.S., a helpful, calm, clear AI assistant. Answer accurately, explain difficult ideas simply, and be honest when you are unsure. Do not claim to control devices or perform actions unless a connected tool has actually completed them."
        },
        { role: "user", content: message }
      ],
      temperature: 0.7
    });

    const answer = completion.choices?.[0]?.message?.content?.trim();
    return res.json({ answer: answer || "I couldn't create an answer. Please try again." });
  } catch (error) {
    console.error("JARVIS chat error:", error?.message || error);
    return res.status(500).json({
      error: "J.A.R.V.I.S. couldn't complete that request. Please try again."
    });
  }
});

app.listen(port, () => {
  console.log(`J.A.R.V.I.S. AI brain listening on port ${port}`);
});
