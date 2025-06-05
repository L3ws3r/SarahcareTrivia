/* server.js — OpenAI v5 & duplicate-answer shield, corrected backticks */
import OpenAI from 'openai';
import express from 'express';
import cors from 'cors';
import { tokenize, jaccard, leaksAnswer, shuffle } from './utils.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(express.json());

const ALLOWED = [/^https?:\/\/localhost(:\d+)?$/, /^https?:\/\/sarahcare-cs\.com$/];
app.use(cors({ origin: (o,cb)=>cb(null, ALLOWED.some(r=>r.test(o||''))) }));

const MAX_TRIES = 6;

function dupAns(ans, seen) {
  if (!seen?.length) return false;
  return seen.some(a => a.toLowerCase() === ans.toLowerCase());
}

app.post('/trivia-question', async (req, res) => {
  const { category = 'General', style = 'fun', seen = [], seenAnswers = [] } = req.body || {};

  const systemPrompt = `You are a trivia generator for seniors. 
Do NOT reuse any of these answers: ${seenAnswers.join(', ')}.
Avoid repeating these question texts:
${seen.join('\n')}
Return JSON {question, correct, distractors} and avoid leaking the answer in the question.`;

  for (let i = 0; i < MAX_TRIES; i++) {
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Give me one ${style} ${category} trivia question for seniors with 3 distractors.` }
      ],
      response_format: { type: 'json_object' }
    });

    let data;
    try {
      data = JSON.parse(chat.choices[0].message.content);
    } catch {
      continue;
    }

    if (leaksAnswer(data.question, data.correct)) continue;
    if (jaccard(data.question, seen) > 0.6) continue;
    if (dupAns(data.correct, seenAnswers)) continue;

    data.answers = shuffle([data.correct, ...data.distractors]);
    return res.json(data);
  }

  // fallback
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
