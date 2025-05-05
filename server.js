const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');
const duckduckgoImages = require('duckduckgo-images-api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// OpenAI setup
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

// Trivia endpoint
app.post('/api/trivia', async (req, res) => {
  const { category, count } = req.body;

  if (!category || !count) {
    return res.status(400).json({ error: 'Missing category or count' });
  }

  try {
    const prompt = `Generate ${count} multiple choice trivia questions about ${category}. Each should be an object with: question, 4 choices (including one correct), and an answer. Return a JSON array like this: [{ "question": "", "choices": [], "answer": "" }]`;

    const chatResponse = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    let questions;

    try {
      questions = JSON.parse(chatResponse.data.choices[0].message.content);
    } catch (err) {
      return res.status(500).json({ error: 'Invalid JSON from OpenAI' });
    }

    // Attach image to each question
    for (let q of questions) {
      try {
        const results = await duckduckgoImages.image_search({ query: q.question, moderate: true });
        q.image = results[0]?.image || null;
      } catch {
        q.image = null;
      }
    }

    res.json({ questions });
  } catch (err) {
    console.error('Trivia generation failed:', err);
    res.status(500).json({ error: 'Trivia generation failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
