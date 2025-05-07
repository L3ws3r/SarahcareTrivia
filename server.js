
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/ask-gpt", async (req, res) => {
  const { category, answerCount } = req.body;
  const numAnswers = answerCount || 4;

  console.log("POST /ask-gpt =>", category, numAnswers);

  const prompt = `Create one trivia question in the category "${category}" with ${numAnswers} multiple choice answers.
Respond with a JSON object in this format:
{
  "question": "Question goes here",
  "choices": {
    "A": "First option",
    "B": "Second option",
    "C": "Third option",
    "D": "Fourth option",
    "E": "Fifth option (optional)"
  },
  "correct": "C",
  "fact": "One-sentence fun fact related to the question"
}`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.data.choices[0].message.content;
    console.log("GPT Response:", content);

    const cleanContent = content.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanContent);

    res.json(data);
  } catch (err) {
    console.error("GPT Error:", err);
    res.status(500).json({ error: "Failed to get trivia question." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
