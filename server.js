import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/ask', async (req, res) => {
  const { category, answerCount } = req.body;
  if (!category || !answerCount) {
    return res.status(400).json({ error: 'Missing category or answerCount' });
  }

  const prompt = `
Generate ONE multiple-choice trivia question in JSON ONLY, with these keys:
  "question": string
  "answers": array of ${answerCount} strings
  "correctIndex": integer (0-${answerCount - 1})

Category: "${category}"
Respond with pure JSON only.
`.trim();

  try {
    const chatRes = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    let text = chatRes.choices[0].message.content.trim();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end >= 0) {
      text = text.slice(start, end + 1);
    }

    const payload = JSON.parse(text);
    return res.json(payload);
  } catch (err) {
    console.error('❌ /ask error:', err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
