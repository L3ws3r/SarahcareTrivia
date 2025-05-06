const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serves your HTML, CSS, images

// DuckDuckGo backend image fetcher
async function fetchDuckDuckGoImage(query) {
  try {
    const homepageRes = await axios.get('https://duckduckgo.com/', {
      params: { q: query },
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const vqdMatch = homepageRes.data.match(/vqd='([a-zA-Z0-9\\-]+)'/);
    if (!vqdMatch) {
      throw new Error('Failed to extract vqd token');
    }

    const vqd = vqdMatch[1];

    const imageRes = await axios.get('https://duckduckgo.com/i.js', {
      params: {
        q: query,
        vqd: vqd,
        o: 'json'
      },
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    return imageRes.data.results?.[0]?.image || null;
  } catch (error) {
    console.error("DuckDuckGo image fetch failed:", error.message);
    return null;
  }
}

// Direct image lookup endpoint
app.get('/api/images', async (req, res) => {
  const query = req.query.q;
  const image = await fetchDuckDuckGoImage(query);
  res.json({ image });
});

// Trivia generator
app.post('/api/trivia', async (req, res) => {
  const category = req.body.category || 'General';
  const count = req.body.count || 10;

  const prompt = new PromptTemplate({
    inputVariables: ['category', 'count'],
    template: `
Generate {count} fun trivia questions about "{category}".
For each question, include:
- The question
- The correct answer
- 3 plausible wrong answers
Respond in JSON format:
[
  {{
    "question": "Question text",
    "answer": "Correct Answer",
    "choices": ["Correct", "Wrong1", "Wrong2", "Wrong3"]
  }},
  ...
]
`,
  });

  try {
    const chat = new ChatOpenAI({
      temperature: 0.7,
      modelName: 'gpt-4',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const promptText = await prompt.format({ category, count });
    const response = await chat.invoke(promptText);

    let questions = [];
    try {
      questions = JSON.parse(response.content);
    } catch {
      return res.status(500).json({ error: 'AI returned invalid JSON' });
    }

    // Add image to each question
    const enriched = await Promise.all(
      questions.map(async (q) => {
        const image = await fetchDuckDuckGoImage(`${category} ${q.question}`);
        const fallback = 'https://upload.wikimedia.org/wikipedia/commons/6/65/Big_question_mark.svg';
        return { ...q, image: image || fallback };
      })
    );

    res.json({ questions: enriched });
  } catch (err) {
    console.error("🔥 Trivia generation error:", err);
    res.status(500).json({ error: 'Failed to generate trivia' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
