// server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔍 DuckDuckGo image search function
async function fetchDuckDuckGoImage(query) {
  try {
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
    const html = await fetch(searchUrl).then(res => res.text());
    const vqdMatch = html.match(/vqd='([\d-]+)'/);
    if (!vqdMatch) return null;

    const vqd = vqdMatch[1];
    const imgApiUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}`;
    const response = await fetch(imgApiUrl);
    const data = await response.json();

    return data.results?.[0]?.image || null;
  } catch (err) {
    console.error('Image fetch error:', err.message);
    return null;
  }
}

// 🧠 Trivia route
app.post('/api/trivia', async (req, res) => {
  try {
    const { category = "General", count = 10 } = req.body;

    const prompt = `Generate ${count} multiple-choice trivia questions about "${category}". Format each question as:
{
  "question": "What is the capital of France?",
  "choices": ["Paris", "London", "Rome", "Berlin"],
  "answer": "Paris"
}
Return ONLY a raw JSON array — no markdown or commentary.`;

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });

    const rawContent = chatResponse.choices[0].message.content;
    const questions = JSON.parse(rawContent);

    // Attach DuckDuckGo image to each question
    for (const q of questions) {
      const keyword = q.answer || q.question;
      q.image = await fetchDuckDuckGoImage(keyword);
    }

    res.json({ questions });
  } catch (err) {
    console.error("Trivia generation failed:", err.message);
    res.status(500).json({ error: "Trivia generation failed." });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
