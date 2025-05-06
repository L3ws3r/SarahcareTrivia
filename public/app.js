// GPT-based Trivia Logic for SarahCare App

const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"; // Replace or set in environment on Render
const MODEL = "gpt-4";

let currentQuestionIndex = 0;
let currentQuestions = [];
let score = 0;
let selectedAnswer = null;

async function fetchGPTQuestion(category, answerCount) {
  const prompt = `Create a trivia question in the category "${category}". Provide:
- One clear trivia question (suitable for a senior audience)
- ${answerCount} multiple choice answers labeled A–${String.fromCharCode(64 + answerCount)}
- Identify the correct answer letter (e.g., 'B')
- Include a short fun fact explanation for the answer
- If applicable, include a relevant real-world image URL

Return in JSON format with keys: question, choices, correct, fact, image_url.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const rawText = data.choices[0].message.content;
  try {
    return JSON.parse(rawText);
  } catch (e) {
    console.error("Failed to parse GPT response:", rawText);
    return null;
  }
}

async function generateQuestions(category, count, answerCount) {
  for (let i = 0; i < count; i++) {
    const q = await fetchGPTQuestion(category, answerCount);
    if (q) currentQuestions.push(q);
  }
  displayQuestion();
}

function displayQuestion() {
  const q = currentQuestions[currentQuestionIndex];
  if (!q) return;

  document.getElementById("question-text").innerText = q.question;
  const img = document.getElementById("question-img");
  img.src = q.image_url || "";
  img.style.display = q.image_url ? "block" : "none";

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";
  Object.entries(q.choices).forEach(([key, value]) => {
    const btn = document.createElement("button");
    btn.innerText = `${key}: ${value}`;
    btn.className = "btn answer-btn";
    btn.onclick = () => selectAnswer(key);
    answersDiv.appendChild(btn);
  });

  document.getElementById("feedback").innerText = "";
  document.getElementById("fun-fact").innerText = q.fact;
  document.getElementById("fun-fact").style.display = "none";
}

function selectAnswer(letter) {
  selectedAnswer = letter;
}

function submitAnswer() {
  const correct = currentQuestions[currentQuestionIndex].correct;
  const feedback = document.getElementById("feedback");
  if (selectedAnswer === correct) {
    feedback.innerText = "Correct! 🎉";
    score++;
  } else {
    feedback.innerText = `Oops! The correct answer was ${correct}`;
  }
  selectedAnswer = null;
}

function toggleFunFact() {
  const fact = document.getElementById("fun-fact");
  fact.style.display = fact.style.display === "none" ? "block" : "none";
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= currentQuestions.length) {
    endGame();
  } else {
    displayQuestion();
  }
}

function endGame() {
  document.getElementById("trivia-screen").classList.remove("visible");
  document.getElementById("end-screen").classList.add("visible");
  document.getElementById("score").innerText = `You got ${score} out of ${currentQuestions.length} correct.`;
}

function goHome() {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("visible"));
  document.getElementById("home-screen").classList.add("visible");
}

function startGame() {
  const category = document.getElementById("category-input").value || "General Trivia";
  const questionCount = parseInt(document.getElementById("question-count").value) || 5;
  const fiveAnswers = document.getElementById("five-answers").checked;
  score = 0;
  currentQuestionIndex = 0;
  currentQuestions = [];

  document.getElementById("home-screen").classList.remove("visible");
  document.getElementById("trivia-screen").classList.add("visible");

  generateQuestions(category, questionCount, fiveAnswers ? 5 : 4);
}

function showHint() {
  const question = currentQuestions[currentQuestionIndex].question;
  fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: `Give a helpful, senior-friendly hint for this trivia question: \"${question}\"` }],
      temperature: 0.7,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      const hint = data.choices[0].message.content;
      alert("Hint: " + hint);
    })
    .catch((err) => console.error("Hint error:", err));
}

// Expose functions globally for onclick
window.startGame = startGame;
window.goHome = goHome;
window.submitAnswer = submitAnswer;
window.toggleFunFact = toggleFunFact;
window.nextQuestion = nextQuestion;
window.showHint = showHint;
