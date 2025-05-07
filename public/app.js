
let currentQuestionIndex = 0;
let currentQuestions = [];
let score = 0;
let correctCount = 0;
let wrongCount = 0;

async function fetchGPTQuestion(category, answerCount) {
  const response = await fetch("/ask-gpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, answerCount })
  });
  const data = await response.json();
  if (!data || !data.question) return null;
  return data;
}

async function generateQuestions(category, count, answerCount) {
  currentQuestions = [];
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
  document.getElementById("question-status").innerText =
    "Question " + (currentQuestionIndex + 1) + " of " + currentQuestions.length +
    " | ✅ " + correctCount + " ❌ " + wrongCount;

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";
  Object.entries(q.choices).forEach(([key, value]) => {
    const btn = document.createElement("button");
    btn.innerText = `${key}: ${value}`;
    btn.className = "btn answer-btn";
    btn.onclick = () => selectAnswer(key, btn);
    answersDiv.appendChild(btn);
  });

  document.getElementById("feedback").innerText = "";
  document.getElementById("fun-fact").innerText = q.fact;
  document.getElementById("fun-fact").style.display = "none";
}

function selectAnswer(letter, button) {
  const correct = currentQuestions[currentQuestionIndex].correct;
  const buttons = document.querySelectorAll(".answer-btn");
  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.innerText.startsWith(correct)) {
      btn.style.backgroundColor = "green";
    } else if (btn.innerText.startsWith(letter)) {
      btn.style.backgroundColor = "red";
    }
  });

  if (letter === correct) {
    correctCount++;
    document.getElementById("feedback").innerText = "Correct! 🎉";
  } else {
    wrongCount++;
    document.getElementById("feedback").innerText = `Oops! Correct answer: ${correct}`;
  }
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
  document.querySelectorAll(".screen").forEach(el => el.style.display = "none");
  document.getElementById("end-screen").style.display = "block";

  const msg = correctCount > wrongCount
    ? "🎉 Congratulations! You're a trivia master!"
    : "🧠 Better luck next time, trivia rookie!";
  document.getElementById("score-title").innerText = `You got ${correctCount} out of ${currentQuestions.length} right.`;
  document.getElementById("end-message").innerText = msg;
}

function goHome() {
  document.querySelectorAll(".screen").forEach(el => el.style.display = "none");
  document.getElementById("home-screen").style.display = "block";
}

function setCategory(cat) {
  document.getElementById("category-input").value = cat;
}

function startGame() {
  const category = document.getElementById("category-input").value || "General Trivia";
  const questionCount = parseInt(document.querySelector("input[name='qCount']:checked").value) || 5;
  const fiveAnswers = document.getElementById("five-answers").checked;

  score = 0;
  correctCount = 0;
  wrongCount = 0;
  currentQuestionIndex = 0;

  document.querySelectorAll(".screen").forEach(el => el.style.display = "none");
  document.getElementById("trivia-screen").style.display = "block";
  document.getElementById("question-text").innerText = "Loading Questions";
  document.getElementById("answers").innerHTML = "";

  generateQuestions(category, questionCount, fiveAnswers ? 5 : 4);
}

function showHint() {
  const question = currentQuestions[currentQuestionIndex].question;
  fetch("/ask-gpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: `Give a helpful, senior-friendly hint for this trivia question: "${question}"`,
      answerCount: 0
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      alert("Hint: " + (data.question || "No hint available."));
    });
}
