
// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Route to get one question at a time
app.post('/ask-gpt', async (req, res) => {
  try {
    const { category, answerCount } = req.body;
    const prompt = `Generate one multiple-choice trivia question in the category "${category}". Include one correct answer and ${parseInt(numChoices) - 1} incorrect answers. Format it as JSON with: { "question": "...", "correct": "...", "incorrect": ["..."], "fact": "..." }`;      answerCount - 1
    } wrong answers, and a fun fact. Format it as JSON like this:

{
  "question": "...",
  "choices": ["...", "...", "...", "..."],
  "correct": "...",
  "funFact": "..."
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    res.json({ questionData: response.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// Health check
app.get('/health', (_req, res) => res.status(200).send('OK'));

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`SarahCare Trivia server running on http://localhost:${port}`);
});
