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
  apiKey: process.env.OPENAI_API_KEY
});

// Generate one question at a time (Option 2)
app.post('/ask-gpt', async (req, res) => {
  try {
    const { category, answerCount } = req.body;

    const prompt = `
Generate exactly one multiple‑choice trivia question in the category "${category}".
- Provide one correct answer and ${answerCount - 1} plausible but clearly incorrect answers (total of ${answerCount}).
- Randomise the position of the correct answer within the list you return.
- Provide an interesting short fun fact related to the question or correct answer.
Return ONLY valid JSON with the following structure (no additional keys, no commentary outside the JSON):
{
  "question": "string",
  "choices": [${Array.from({ length: answerCount }, () => '"string"').join(', ')}],
  "correct": "string",
  "funFact": "string"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8
    });

    const raw = completion.choices[0].message.content.trim();

    // Extract JSON block and parse
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Invalid response format from OpenAI' });
    }

    const data = JSON.parse(jsonMatch[0]);

    if (!data.choices || data.choices.length !== answerCount) {
      return res.status(500).json({ error: 'Incorrect number of choices returned by OpenAI' });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// Health check
app.get('/health', (_req, res) => res.status(200).send('OK'));

// Serve frontend
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`SarahCare Trivia server running on http://localhost:${port}`);
});
