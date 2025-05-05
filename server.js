const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// OpenAI route
app.post('/api/trivia', async (req, res) => {
  const { category, count } = req.body;
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) return res.status(500).json({ error: "Missing OpenAI API key." });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Create ${count} multiple choice trivia questions about ${category}. Format as JSON array with: question, options, answer`
        }]
      })
    });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate trivia." });
  }
});

// Image route (DuckDuckGo)
app.get('/image', async (req, res) => {
  const query = req.query.q;
  try {
    const ddgUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}`;
    const response = await fetch(ddgUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const data = await response.json();
    if (data.results?.length > 0) {
      return res.json({ image: data.results[0].image });
    }
    res.status(404).json({ error: "No image found" });
  } catch {
    res.status(500).json({ error: "Image lookup failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});