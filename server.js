const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serves your HTML, CSS, images

// 🔍 Stub image fetcher to replace DuckDuckGoImages
async function getFirstImageUrl(query) {
  // Real image search is broken — use fallback for now
  return 'https://upload.wikimedia.org/wikipedia/commons/6/65/Big_question_mark.svg';
}

// 🧠 Trivia generation endpoint
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

    // ✅ FIXED: use invoke instead of call
    const response = await chat.invoke(promptText);

    let questions = [];
    try {
      questions = JSON.parse(response.content);
    } catch (err) {
      console.error("❌ Failed to parse JSON from AI:", err);
      return res.status(500).json({ error: 'AI returned invalid JSON' });
    }

    // Add fallback image to each question
    const enriched = await Promise.all(
      questions.map(async (q) => {
        const image = await getFirstImageUrl(`${category} ${q.question}`);
        return { ...q, image };
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
