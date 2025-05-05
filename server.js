const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function fetchDuckDuckGoImage(query) {
  try {
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
    const html = await fetch(searchUrl).then(res => res.text());
    const vqdMatch = html.match(/vqd='([\d-]+)'/);
    if (!vqdMatch) return null;

    const vqd = vqdMatch[1];
    const imgApiUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}`;
    const response = await fetch(imgApiUrl);
    const data = await response.json();

    return data.results?.[0]?.image || null;
  } catch (err) {
    console.error('DuckDuckGo image fetch failed:', err.message);
    return null;
  }
}

app.post('/api/trivia', async (req, res) => {
  try {
    const { category = "General", count = 10 } = req.body;

    const prompt = `Generate ${count} multiple-choice trivia questions about "${category}". Format each question as:
{
  "question": "What is the capital of France?",
  "choices": ["Paris", "London", "Rome", "Berlin"],
  "answer": "Paris"
}
Return ONLY a raw JSON array — no markdown or text.`;

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });

    const rawContent = chatResponse.choices[0].message.content;
    const questions = JSON.parse(rawContent);

    // Attach images
    for (const q of questions) {
      const keyword = q.answer || q.question;
      q.image = await fetchDuckDuckGoImage(keyword);
    }

    res.json({ questions });
  } catch (err) {
    console.error("Trivia generation failed:", err.message);
    res.status(500).json({ error: "Trivia generation failed." });
  }
});
