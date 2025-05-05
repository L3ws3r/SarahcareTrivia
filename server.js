// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Setup OpenAI v4
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Trivia endpoint using ChatGPT
app.post('/api/trivia', async (req, res) => {
  try {
    const { category = "General", count = 10 } = req.body;

    const prompt = `Generate ${count} multiple-choice trivia questions about "${category}". Format each question as a JSON object:
{
  "question": "What is the capital of France?",
  "choices": ["Paris", "London", "Rome", "Berlin"],
  "answer": "Paris"
}
Return ONLY a raw JSON array of ${count} such objects — no markdown, no extra text.`;

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });

    const rawContent = chatResponse.choices[0].message.content;
    console.log("GPT Response:\n", rawContent);

    const questions = JSON.parse(rawContent);
    res.json({ questions });
  } catch (err) {
    console.error("Trivia generation failed:", err.message || err);
    res.status(500).json({ error: "Trivia generation failed." });
  }
});

// ✅ Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
