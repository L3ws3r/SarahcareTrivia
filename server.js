const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// Trivia endpoint
app.post('/api/trivia', async (req, res) => {
  const { category, count } = req.body;

  const prompt = `
Create ${count} trivia questions about "${category}". Each should include:
- A "question" string
- An "options" array with 4 choices
- An "answer" string that matches one of the options

Return only a raw JSON array. Do NOT include markdown or explanation.
Example:
[
  {
    "question": "Who played the lead role of Atticus Finch in the 1962 film 'To Kill a Mockingbird'?",
    "options": ["James Stewart", "Henry Fonda", "Gregory Peck", "Cary Grant"],
    "answer": "Gregory Peck"
  }
]
`;

  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    const trivia = JSON.parse(content);
    res.json(trivia);
  } catch (err) {
    console.error('Trivia error:', err);
    res.status(500).json({ error: 'Failed to generate trivia.' });
  }
});

// Image fetch (DuckDuckGo fallback)
app.get('/image', async (req, res) => {
  const query = req.query.q;
  try {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1`);
    const data = await response.json();
    const image = data.Image || '';
    res.json({ image });
  } catch (err) {
    res.json({ image: '' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
