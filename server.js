
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serves HTML, CSS, images

// Local fallback image fetcher (random or category-based)
function getFallbackImage(query) {
  const fallbackImages = [
    '/images/fallback1.jpg',
    '/images/fallback2.jpg',
    '/images/fallback3.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/6/65/Big_question_mark.svg'
  ];
  // Rotate through them or randomize
  return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
}

// API: Trivia question generator
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

    // Add fallback image to each question
    const enriched = questions.map((q) => {
      const image = getFallbackImage(`${category} ${q.question}`);
      return { ...q, image };
    });

    res.json({ questions: enriched });
  } catch (err) {
    console.error("🔥 Trivia generation error:", err);
    res.status(500).json({ error: 'Failed to generate trivia' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
