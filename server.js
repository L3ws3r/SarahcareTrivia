const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Ensure you installed this: npm install node-fetch

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Route: Serve trivia questions (sample data only for now)
app.post('/api/trivia', (req, res) => {
  const { category, count } = req.body;

  if (!category || !count) {
    return res.status(400).json({ error: 'Missing category or count' });
  }

  const sampleQuestions = Array.from({ length: count }, (_, i) => ({
    question: `Sample Question ${i + 1} for category "${category}"`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    answer: 'Option A'
  }));

  res.json(sampleQuestions);
});

// Route: DuckDuckGo image search
app.get('/image', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing query parameter' });

  try {
    const response = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) throw new Error('DuckDuckGo request failed');
    const data = await response.json();
    const imageUrl = data.results?.[0]?.image || '';

    res.json({ image: imageUrl });
  } catch (err) {
    console.error('DuckDuckGo error:', err.message);
    res.status(500).json({ error: 'Image lookup failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
