import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { tokenize, jaccard, leaksAnswer, shuffle } from './utils.js';
import fallbackQuestion from './fallbackQuestion.js';

dotenv.config();

const ALLOWED_ORIGINS = [
  /^https?:\/\/localhost(?::\d+)?$/,
  /^https?:\/\/sarahcare-cs\.com$/
];

const app = express();

app.use(cors({
  origin: (origin, cb) => {
    // In case of server-to-server or curl.
    if (!origin) return cb(null, true);
    const ok = ALLOWED_ORIGINS.some(r => r.test(origin));
    return cb(null, ok);
  }
}));
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MAX_TRIES = 6;

app.post('/trivia-question', async (req, res) => {
  const { category = 'General Knowledge', style = 'fun', seen = [] } = req.body;
  try {
    for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
      const messages = [
        { role: 'system', content: [
          'You are a trivia generator.',
          'Output JSON only with keys: question, correct, distractors (array of 3), funFact.',
          'Do NOT leak the correct answer verbatim in the question.',
          'Avoid duplicates of these previous questions:',
          ...seen.map((q, i) => `${i + 1}. ${q}`)
        ].join('\n') },
        { role: 'user', content: `Category: ${category}\nStyle adjective: ${style}\nReturn ONE question.` }
      ];
      const chatRes = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 300,
        messages
      });

      let data;
      try {
        data = JSON.parse(chatRes.choices[0].message.content);
      } catch (e) {
        // retry
        continue;
      }

      // shape normalisation
      if (!data.correct && typeof data.correctIndex === 'number' && Array.isArray(data.answers)) {
        data.correct = data.answers[data.correctIndex];
      }
      if (!data.distractors && Array.isArray(data.choices)) {
        data.distractors = data.choices.filter(c => c !== data.correct).slice(0, 3);
      }

      // Guard duplicates and leaks
      if (leaksAnswer(data.question, data.correct)) continue;
      if (seen.some(prev => jaccard(prev, data.question) > 0.6)) continue;

      data.answers = shuffle([data.correct, ...(data.distractors || [])]);
      return res.json(data);
    }
    // fallback
    return res.json(fallbackQuestion);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Trivia backend listening on ${PORT}`);
});