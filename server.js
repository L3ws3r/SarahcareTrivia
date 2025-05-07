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

// OpenAI Configuration for v4
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API Route to fetch GPT-based responses
app.post('/ask-gpt', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({ answer: response.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    res.status(500).json({ error: 'Error fetching data from OpenAI' });
  }
});

// For health check on Render.com
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

// Wildcard route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`SarahCare Trivia server running on http://localhost:${port}`);
});
