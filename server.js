/* server.js — hot‑fix: robust duplicate logic & crash‑proof */
import OpenAI from 'openai';
import express from 'express';
import cors from 'cors';
import { tokenize, leaksAnswer, shuffle } from './utils.js';

/* local jaccard + duplicate helper — independent of utils implementation */
function jaccard(a, b) {
  const A = new Set(tokenize(a));
  const B = new Set(tokenize(b));
  const intersection = [...A].filter(x => B.has(x)).length;
  return intersection / (A.size + B.size - intersection);
}
function isDuplicate(q, seenList = []) {
  for (const old of seenList) {
    if (jaccard(q, old) > 0.6) return true;
  }
  return false;
}
function dupAns(ans, seenA = []) {
  return seenA.some(a => a.toLowerCase() === ans.toLowerCase());
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(express.json());

const ORIGINS = [/^https?:\/\/localhost(:\d+)?$/, /^https?:\/\/sarahcare-cs\.com$/];
app.use(cors({ origin: (o, cb) => cb(null, ORIGINS.some(r => r.test(o || ''))) }));

const MAX_TRIES = 6;

app.post('/trivia-question', async (req, res) => {
  const { category = 'General', style = 'fun', seen = [], seenAnswers = [] } = req.body || {};

  const systemPrompt = `You are a trivia generator for seniors. 
Do NOT reuse any of these answers: ${seenAnswers.join(', ')}.
Avoid repeating these question texts:
${seen.join('\n')}
Return JSON {question, correct, distractors}. Avoid leaking the answer in the question.`;

  for (let i = 0; i < MAX_TRIES; i++) {
    let data;

    try {
      const chat = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Provide one ${style} ${category} trivia question with 3 distractors.` }
        ],
        response_format: { type: 'json_object' }
      });
      data = JSON.parse(chat.choices[0].message.content);
    } catch (err) {
      console.error('OpenAI error or JSON parse fail:', err?.message);
      continue;
    }

    if (leaksAnswer(data.question, data.correct)) continue;
    if (isDuplicate(data.question, seen)) continue;
    if (dupAns(data.correct, seenAnswers)) continue;

    data.answers = shuffle([data.correct, ...data.distractors]);
    return res.json(data);
  }

  // graceful fallback so we never 502
  const fallback = {
    question: 'Which planet is known as the Red Planet?',
    correct: 'Mars',
    distractors: ['Venus', 'Jupiter', 'Mercury']
  };
  fallback.answers = shuffle([fallback.correct, ...fallback.distractors]);
  res.json(fallback);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Trivia server running on port ${PORT}`));
