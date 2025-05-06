// GPT-based Trivia Logic for SarahCare App (Backend Version)

let currentQuestionIndex = 0;
let currentQuestions = [];
let score = 0;
let selectedAnswer = null;

async function fetchGPTQuestion(category, answerCount) {
  const response = await fetch("/ask-gpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category, answerCount })
  });

  const data = await response.json();
  if (!data || !data.question) {
    console.error("Invalid data from /ask-gpt:", data);
    return null;
  }
  return data;
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
  img.onerror = () => (img.style.display = "none");

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

  document.getElementById("loading").style.display = "block";
  generateQuestions(category, questionCount, fiveAnswers ? 5 : 4).then(() => {
    document.getElementById("loading").style.display = "none";
  });
}

function showHint() {
  const question = currentQuestions[currentQuestionIndex].question;
  fetch("/ask-gpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      category: `Give a helpful, senior-friendly hint for this trivia question: "${question}"`,
      answerCount: 0 // not needed for hint
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      alert("Hint: " + (data.question || "No hint available."));
    })
    .catch((err) => console.error("Hint error:", err));
}

window.startGame = startGame;
window.goHome = goHome;
window.submitAnswer = submitAnswer;
window.toggleFunFact = toggleFunFact;
window.nextQuestion = nextQuestion;
window.showHint = showHint;
