const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const duckduckgoImages = require("duckduckgo-images-api");

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/trivia", async (req, res) => {
  const { category, count } = req.body;

  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }

  try {
    const prompt = `Generate ${count || 5} fun, simple trivia questions for seniors. Each should include a multiple choice format with 1 correct answer and 3 wrong answers. The category is "${category}". Return as JSON array like: [{"question":"...","choices":["A","B","C","D"],"answer":"A"}]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices[0].message.content;

    // Attempt to extract a valid JSON block
    const jsonStart = raw.indexOf("[");
    const jsonEnd = raw.lastIndexOf("]") + 1;
    const jsonString = raw.slice(jsonStart, jsonEnd);
    let questions = JSON.parse(jsonString);

    // Get related image for each question (optional)
    for (let q of questions) {
      const imageResults = await duckduckgoImages.image_search({ query: q.question, moderate: true });
      if (imageResults.length > 0) {
        q.image = imageResults[0].image;
      }
    }

    res.json({ questions });
  } catch (err) {
    console.error("Error generating trivia:", err);
    res.status(500).json({ error: "Trivia generation failed" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
