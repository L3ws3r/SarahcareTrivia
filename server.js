import express from 'express';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

app.post('/ask', async (req, res) => {
  const { category, answerCount } = req.body;
  try {
    const promptText = `Generate one multiple-choice trivia question in JSON format with these keys: "question" (string), "answers" (array of ${answerCount} strings), and "correctIndex" (number). Category: "${category}".`;
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: promptText,
      max_tokens: 200,
      temperature: 0.7,
    });
    const text = completion.data.choices[0].text.trim();
    const payload = JSON.parse(text);
    res.json(payload);
  } catch (err) {
    console.error('Error generating trivia:', err);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
