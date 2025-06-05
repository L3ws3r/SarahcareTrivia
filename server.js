
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// New: POST /trivia-question for frontend
app.post('/trivia-question', async (req, res) => {
  let { category, seen, model } = req.body;
  const answerCount = 4;
  const systemPrompt = `
    Generate ONE multiple-choice trivia question in JSON ONLY, with these keys:
    "question": string
    "choices": array of ${answerCount} strings
    "correct": string (the exact correct answer from the choices)
    "funFact": string (a brief, interesting fact related to the question)

    Category: "${category || 'General Knowledge'}"
    Avoid duplicates from this list: ${seen && seen.length ? JSON.stringify(seen).slice(0, 400) : '[]'}
    Respond with pure JSON only.
  `.trim();
  try {
    const chatRes = await openai.chat.completions.create({
      model: model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: systemPrompt }],
      temperature: 0.7,
      max_tokens: 350,
    });
    let text = chatRes.choices[0].message.content.trim();
    // Extract valid JSON from the AI response
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd >= 0) {
      text = text.slice(jsonStart, jsonEnd + 1);
    }
    let payload;
    try {
      payload = JSON.parse(text);
    } catch (jsonErr) {
      return res.status(500).json({ error: 'AI did not return valid JSON', raw: text });
    }
    // Provide fallback defaults for required keys
    if (!payload.choices && payload.answers) payload.choices = payload.answers;
    if (!payload.correct && typeof payload.correctIndex === 'number' && Array.isArray(payload.choices))
      payload.correct = payload.choices[payload.correctIndex];
    if (!payload.funFact) payload.funFact = 'No fun fact provided.';
    if (!payload.question || !payload.choices || !payload.correct)
      return res.status(500).json({ error: 'AI output missing required fields', raw: payload });
    return res.json({
      question: payload.question,
      choices: payload.choices,
      correct: payload.correct,
      funFact: payload.funFact
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Legacy route /ask for manual queries
app.post('/ask', async (req, res) => {
  let { prompt, category, answerCount } = req.body;
  // Fallback to legacy logic if prompt missing
  if (!prompt) {
    prompt = `
      Generate ONE multiple-choice trivia question in JSON ONLY, with these keys:
      "question": string
      "answers": array of ${answerCount || 4} strings
      "correctIndex": integer (0-${(answerCount || 4) - 1})
      "funFact": string (a brief, interesting fact related to the question)

      Category: "${category || 'General Knowledge'}"
      Respond with pure JSON only.
    `.trim();
  }
  try {
    const chatRes = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 350,
    });
    let text = chatRes.choices[0].message.content.trim();
    // Extract valid JSON from the AI response
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd >= 0) {
      text = text.slice(jsonStart, jsonEnd + 1);
    }
    let payload;
    try {
      payload = JSON.parse(text);
    } catch (jsonErr) {
      return res.status(500).json({ error: 'AI did not return valid JSON', raw: text });
    }
    if (!payload.funFact) payload.funFact = 'No fun fact provided.';
    return res.json(payload);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SarahCare Trivia backend listening on port ${PORT}`);
});
