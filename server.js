// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Set up OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Trivia endpoint
app.post('/api/trivia', async (req, res) => {
  try {
    const { category = "General", count = 10 } = req.body;

    const prompt = `Generate ${count} multiple-choice trivia questions in the category "${category}". 
Each should be a JSON object like this:
{
  "question": "What is the capital of France?",
  "choices": ["Berlin", "Paris", "London", "Madrid"],
  "answer": "Paris"
}
Return an array of exactly ${count} questions. Do NOT include markdown or explanation, just raw JSON.`;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.data.choices[0].message.content;

    // Optional debug log
    console.log("GPT Response:", content);

    const questions = JSON.parse(content);
    res.json({ questions });
  } catch (err) {
    console.error("Trivia generation failed:", err.message);
    res.status(500).json({ error: "Trivia generation failed." });
  }
});

// Fallback to index.html for frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
