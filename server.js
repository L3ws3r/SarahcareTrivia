const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const duckduckgoImages = require('duckduckgo-images-api');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // serves HTML/CSS/images

// 🔍 Image helper
async function getFirstImageUrl(query) {
  try {
    const results = await duckduckgoImages.search({ query, moderate: true });
    return results[0]?.image;
  } catch (err) {
    console.error('Image fetch error:', err);
    return null;
  }
}

// 🧠 Trivia endpoint
app.post('/api/trivia', async (req, res) => {
  const category = req.body.category || 'General';
  const count = req.body.count || 10;

  const prompt = new PromptTemplate({
    inputVariables: ['category', 'count'],
    template: `
Generate {count} fun trivia questions about "{category}".
Each question must include:
- "question": the trivia question text
- "answer": the correct answer
- "choices": a shuffled array of one correct answer and 3 plausible wrong ones

Respond in valid JSON format like:
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
    const response = await chat.invoke(promptText); // ✅ fix: invoke instead of call

    let questions;
    try {
      questions = JSON.parse(response.content);
    } catch (e) {
      console.error('❌ JSON parse error:', e.message);
      return res.status(500).json({ error: 'AI returned invalid JSON' });
    }

    const enriched = await Promise.all(
      questions.map(async (q) => {
        const image = await getFirstImageUrl(`${category} ${q.question}`);
        const fallback = 'https://upload.wikimedia.org/wikipedia/commons/6/65/Big_question_mark.svg';
        return { ...q, image: image || fallback };
      })
    );

    res.json({ questions: enriched });
  } catch (err) {
    console.error('🔥 Trivia generation error:', err.message);
    res.status(500).json({ error: 'Failed to generate trivia' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
