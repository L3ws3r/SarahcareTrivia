import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/ask', async (req, res) => {
  const { prompt } = req.body;
  const start = Date.now();
  try {
    const aiStart = Date.now();
    const chatRes = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 350,
    });
    const aiEnd = Date.now();
    console.log('OpenAI API time:', (aiEnd - aiStart) + 'ms');
    console.log('Total /ask handler time:', (Date.now() - start) + 'ms');
    let text = chatRes.choices[0].message.content.trim();

    // Try to extract valid JSON (strip markdown, text, etc.)
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd >= 0) {
      text = text.slice(jsonStart, jsonEnd + 1);
    }

    let payload;
    try {
      payload = JSON.parse(text);
    } catch (jsonErr) {
      console.error('AI did not return valid JSON. Full output:', text);
      return res.status(500).json({ error: 'AI did not return valid JSON', raw: text });
    }

    if (!payload.funFact) payload.funFact = 'No fun fact provided.';
    return res.json(payload);

  } catch (err) {
    console.error('Error in /ask:', err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
