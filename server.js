const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");
const { image_search } = require("duckduckgo-images-api");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static frontend files (HTML, CSS, JS, images)
app.use(express.static("public"));

// 🧠 Set up OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 📚 Trivia Question Generator
async function generateTriviaQuestions(category, count = 10) {
  const prompt = `
Generate ${count} trivia questions about "${category}". 
Each should have a question, 1 correct answer, and 3 incorrect answers. 
Format as JSON like this:

[
  {
    "question": "...",
    "answer": "...",
    "choices": ["...", "...", "...", "..."]
  }
]`;

  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  try {
    const jsonStart = chatResponse.choices[0].message.content.indexOf("[");
    const json = chatResponse.choices[0].message.content.slice(jsonStart);
    return JSON.parse(json);
  } catch (err) {
    console.error("❌ Error parsing trivia JSON:", err);
    return [];
  }
}

// 🖼️ DuckDuckGo image fetcher
async function getFirstImageUrl(query) {
  try {
    const results = await image_search({ query, moderate: true });
    return results?.[0]?.image || null;
  } catch (err) {
    console.error("❌ Image fetch error:", err);
    return null;
  }
}

// 🚀 API route for trivia generation
app.post("/api/trivia", async (req, res) => {
  const { category, count } = req.body;

  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }

  try {
    const questions = await generateTriviaQuestions(category, count || 10);

    const enhancedQuestions = await Promise.all(
      questions.map(async (q) => {
        const image = await getFirstImageUrl(`${category} ${q.question}`);
        return { ...q, image };
      })
    );

    res.json({ questions: enhancedQuestions });
  } catch (err) {
    console.error("❌ Trivia generation failed:", err);
    res.status(500).json({ error: "Trivia generation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
