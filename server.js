
/**
 * SarahCare Trivia backend – CORS‑enabled (fixed template literal)
 * ---------------------------------------------------------------
 * Allows CORS for sarahcare-cs.com and localhost,
 * prevents answer leaks & duplicates.
 */
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import { OpenAI } from "openai";
dotenv.config();

const app = express();

// ---- CORS ----
const ALLOWED = [
  "https://sarahcare-cs.com",
  "http://localhost:5173",
  "http://localhost:3000"
];
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non‑browser tools (no origin) or whitelisted domains
      if (!origin || ALLOWED.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    }
  })
);
app.options("*", cors());

app.use(bodyParser.json({ limit: "1mb" }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PORT = process.env.PORT || 8080;

/* ---------- helpers ---------- */
function leaksAnswer(question, answer) {
  const q = question.toLowerCase(),
    a = answer.toLowerCase();
  if (q.includes(a)) return true;
  const tokens = a.split(/\s+/).filter((t) => t.length > 2);
  const hits = tokens.filter((t) => q.includes(t)).length;
  return hits / tokens.length >= 0.6;
}
function jaccard(a, b) {
  const A = new Set(a.split(/\s+/)),
    B = new Set(b.split(/\s+/));
  const inter = [...A].filter((x) => B.has(x)).length;
  return inter / (A.size + B.size - inter);
}
function isDuplicate(q, seen) {
  return seen.some((p) => jaccard(q.toLowerCase(), p.toLowerCase()) > 0.7);
}
function buildSystemPrompt({ category, style }) {
  return (
`You are an expert trivia writer for senior citizens.
Return ONLY valid JSON in the form: {question, correct, distractors[]}
Rules (strict):
1. The correct answer must NOT appear verbatim in the question.
2. If that happens, regenerate.
3. Do not show meta commentary.
4. Provide exactly 3 concise distractors.
${category ? `Category: ${category}.` : ""}
${style ? `Use the adjective "${style}" in the tone.` : ""}`
  ).trim();
}

async function generateOne({ category, style }) {
  const system = buildSystemPrompt({ category, style });
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0.8,
    messages: [
      { role: "system", content: system },
      { role: "user", content: "Generate one trivia item." }
    ],
    response_format: { type: "json_object" }
  });
  return res.choices[0].message.content.trim();
}
async function generateQuestion({ category, style, seen }) {
  for (let i = 0; i < 6; i++) {
    try {
      const raw = await generateOne({ category, style });
      const data = JSON.parse(raw);
      if (
        !data.question ||
        !data.correct ||
        !Array.isArray(data.distractors) ||
        data.distractors.length !== 3
      )
        throw new Error("Shape error");
      if (leaksAnswer(data.question, data.correct) || isDuplicate(data.question, seen))
        continue;
      return data;
    } catch (err) {
      console.error("Regeneration needed:", err.message);
    }
  }
  return {
    question: "Which season follows winter?",
    correct: "Spring",
    distractors: ["Autumn", "Summer", "Monsoon"]
  };
}

/* ---------- route ---------- */
app.post("/trivia-question", async (req, res) => {
  const { category = "", style = "", seen = [] } = req.body || {};
  try {
    const q = await generateQuestion({ category, style, seen });
    res.json(q);
  } catch (err) {
    console.error("Fatal:", err);
    res.status(500).json({ error: "Server failure" });
  }
});

/* ---------- start ---------- */
app.listen(PORT, () => console.log("Trivia backend with CORS on", PORT));
