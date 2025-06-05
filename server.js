import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Utility — basic "answer leakage" detector.
 * Returns true if the correct answer appears verbatim in the question
 * OR if the majority of answer tokens (>60%) appear in the question stem.
 */
function leaksAnswer(question = '', answer = '') {
  const q = question.toLowerCase();
  const a = answer.toLowerCase().trim();
  if (!q || !a) return false;
  if (q.includes(a)) return true;
  const tokens = a.split(/\s+/).filter(t => t.length > 2);
  const hits = tokens.filter(t => q.includes(t)).length;
  return tokens.length > 0 && hits / tokens.length > 0.6;
}

/**
 * Utility — naive duplicate detector against a list of previous question texts.
 * Declares duplicate if Jaccard similarity over tokens exceeds 0.6.
 */
function isDuplicate(question = '', seen = []) {
  if (!question || !seen.length) return false;
  const tokenize = str => new Set(str.toLowerCase().split(/\s+/).filter(t => t));
  const A = tokenize(question);
  for (const prev of seen) {
    const B = tokenize(prev);
    const inter = [...A].filter(x => B.has(x)).length;
    const jaccard = inter / (A.size + B.size - inter);
    if (jaccard > 0.6) return true;
  }
  return false;
}

// New: POST /trivia-question for frontend
app.post('/trivia-question', async (req, res) => {
  let { category, style = 'fun', seen = [], model = 'gpt-3.5-turbo' } = req.body || {};
  const answerCount = 4;
  const adjectiveMap = {
    fun: 'casual, humorous',
    popular: 'well‑known, crowd‑pleasing',
    hard: 'challenging, less obvious',
    obscure: 'very little‑known',
    lighthearted: 'playful'
  };
  const adjective = adjectiveMap[style] || adjectiveMap['fun'];

  /**
   * PROMPT with anti‑leak and anti‑duplicate rules.
   * We send the full *question text* history so GPT can avoid overlaps semantically.
   */
  const basePrompt = ({ dupList }) => `
You are generating ONE ${adjective} multiple‑choice trivia question.
Return *only* valid JSON with keys:
  "question": string
  "choices": string[${answerCount}]
  "correct": string  (must match one of the choices exactly)
  "funFact": string  (brief extra fact)

RULES (STRICT):
1. Do **NOT** include the correct answer verbatim inside the question text.
2. If your draft violates Rule 1, regenerate internally *before* answering.
3. Avoid any topic already covered by the following previous questions:
   ${dupList}
4. Do NOT output anything except the JSON object.

Category: "${category || 'General Knowledge'}"
`.trim();

  const maxAttempts = 6;
  let attempts = 0;
  let lastError = null;

  while (attempts < maxAttempts) {
    const prompt = basePrompt({ dupList: JSON.stringify(seen).slice(0, 800) });
    try {
      const chatRes = await openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 350
      });

      let text = chatRes.choices[0].message.content.trim();
      // Extract JSON
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd >= 0) {
        text = text.slice(jsonStart, jsonEnd + 1);
      }
      const payload = JSON.parse(text);

      // Fallback: map legacy keys
      if (!payload.choices && payload.answers) payload.choices = payload.answers;
      if (!payload.correct && typeof payload.correctIndex === 'number') {
        payload.correct = payload.choices?.[payload.correctIndex];
      }
      if (!payload.funFact) payload.funFact = 'No fun fact provided.';

      // Validation
      if (!payload.question || !payload.choices || !payload.correct) {
        lastError = 'AI output missing required fields';
        attempts++;
        continue;
      }

      // Anti‑leak check
      if (leaksAnswer(payload.question, payload.correct)) {
        lastError = 'Answer leaked in question, retrying…';
        attempts++;
        continue;
      }
      // Duplicate check
      if (isDuplicate(payload.question, seen)) {
        lastError = 'Duplicate question, retrying…';
        attempts++;
        continue;
      }

      // Success — return to client
      return res.json(payload);

    } catch (err) {
      lastError = err.message;
      attempts++;
    }
  }

  // If we get here, all attempts failed
  return res.status(500).json({ error: `Failed after ${maxAttempts} attempts: ${lastError}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SarahCare Trivia backend listening on port ${PORT}`);
});
