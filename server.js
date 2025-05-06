const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "gpt-3.5-turbo";

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/ask-gpt", async (req, res) => {
  const { category, answerCount, questionCount } = req.body;

  const prompt = `Create ${questionCount} trivia questions in the category "${category}". For each, provide:
- One clear trivia question (suitable for a senior audience)
- ${answerCount} multiple choice answers labeled A–${String.fromCharCode(64 + answerCount)}
- Identify the correct answer letter (e.g., 'B')
- Include a short fun fact explanation for the answer
- Omit image URLs for now

Return in JSON array format. Each object must contain keys: question, choices, correct, fact.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "Invalid response from OpenAI" });
    }

    let rawText = data.choices[0].message.content;

    // Remove markdown code fences
    rawText = rawText.trim();
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    }

    try {
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err) {
      console.error("Failed to parse GPT response:", err);
      res.status(500).json({ error: "Failed to parse GPT output", raw: rawText });
    }
  } catch (err) {
    console.error("GPT fetch error:", err);
    res.status(500).json({ error: "Error communicating with OpenAI" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
