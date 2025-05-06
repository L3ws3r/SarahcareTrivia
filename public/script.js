
let currentQuestion = 0;
let questions = [];
let score = 0;

function startGame() {
  currentQuestion = 0;
  score = 0;
  document.getElementById("home-screen").classList.remove("visible");
  document.getElementById("trivia-screen").classList.add("visible");
  loadQuestions();
}

function goHome() {
  document.querySelectorAll(".screen").forEach(el => el.classList.remove("visible"));
  document.getElementById("home-screen").classList.add("visible");
}

function loadQuestions() {
  // Placeholder for OpenAI or spreadsheet logic
  questions = [
    {
      question: "What iconic TV show featured a talking horse?",
      choices: {
        A: "Mr. Ed",
        B: "Lassie",
        C: "Bonanza",
        D: "Gilligan's Island"
      },
      correct: "A",
      fact: "Mr. Ed was a sitcom from the 1960s where a horse could talk.",
      image_url: ""
    }
  ];
  renderQuestion();
}

function renderQuestion() {
  const q = questions[currentQuestion];
  document.getElementById("question-text").textContent = q.question;
  document.getElementById("question-img").src = q.image_url || "";
  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";
  for (let key in q.choices) {
    const btn = document.createElement("button");
    btn.className = "btn answer-btn";
    btn.textContent = `${key}: ${q.choices[key]}`;
    btn.onclick = () => selectAnswer(key);
    answersDiv.appendChild(btn);
  }
  document.getElementById("feedback").textContent = "";
  document.getElementById("fun-fact").textContent = q.fact;
  document.getElementById("fun-fact").style.display = "none";
}

let selected = null;
function selectAnswer(key) {
  selected = key;
  const btns = document.querySelectorAll(".answer-btn");
  btns.forEach(btn => btn.style.backgroundColor = "#0077cc");
  const target = Array.from(btns).find(btn => btn.textContent.startsWith(key));
  if (target) target.style.backgroundColor = "#ffa500";
}

function submitAnswer() {
  const q = questions[currentQuestion];
  const feedback = document.getElementById("feedback");
  if (selected === q.correct) {
    feedback.textContent = "Correct!";
    score++;
  } else {
    feedback.textContent = `Oops! The correct answer was ${q.correct}: ${q.choices[q.correct]}`;
  }
}

function toggleFunFact() {
  const fact = document.getElementById("fun-fact");
  fact.style.display = fact.style.display === "none" ? "block" : "none";
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    renderQuestion();
  } else {
    showEndScreen();
  }
}

function showEndScreen() {
  document.getElementById("trivia-screen").classList.remove("visible");
  document.getElementById("end-screen").classList.add("visible");
  document.getElementById("score").textContent = `You got ${score} out of ${questions.length} correct!`;
}
