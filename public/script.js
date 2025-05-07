
const presetCategories = [
  "Movies", "Classic TV", "Music", "Presidents", "History", "Science",
  "Sports", "Animals", "Food", "Geography", "Famous People", "Cars",
  "Holidays", "Cartoons", "80s", "90s", "Disney", "Broadway", "Landmarks", "Inventions"
];

let current = 0;
let previousQuestions = [];
let correct = 0;
let wrong = 0;
let answerCount = 4;
let totalQuestions = 10;
let answered = false;
let category = "General";

const app = document.getElementById("app");
const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");

const loadingScreen = document.createElement("div");
loadingScreen.id = "loadingScreen";
loadingScreen.classList.add("hidden");
loadingScreen.innerHTML = `<h2>Generating your trivia question...</h2><p>Please wait 🧠</p>`;
app.appendChild(loadingScreen);

document.getElementById("presetCategories").innerHTML =
  presetCategories.map(cat => `<button class="categoryBtn">${cat}</button>`).join("");

document.getElementById("presetCategories").addEventListener("click", async (e) => {
  if (e.target.classList.contains("categoryBtn")) {
    category = e.target.textContent;
    document.getElementById("customCategory").value = category;
    startGame();
  }
});

document.getElementById("customCategory").addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    category = e.target.value.trim() || "General";
    startGame();
  }
});

function startGame() {
  current = correct = wrong = 0;
  answerCount = parseInt(document.querySelector('input[name="choices"]:checked').value);
  totalQuestions = parseInt(document.querySelector('input[name="count"]:checked').value);
  const theme = document.getElementById("themePicker").value;
  document.body.className = theme;

  homeScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  loadingScreen.classList.remove("hidden");

  document.getElementById("correctCount").textContent = `✅ 0`;
  document.getElementById("wrongCount").textContent = `❌ 0`;

  fetchAndShowNextQuestion();
}

async function fetchAndShowNextQuestion() {
  answered = false;
  loadingScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
  document.getElementById("extraInfo").textContent = "";

  
    const prompt = `Generate a new multiple-choice trivia question in the category "${category}" with ${answerCount} options. Do NOT repeat or closely resemble any of these:
${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
Format the result as JSON with fields: question, choices[], correct, funFact.`;

    const res = await fetch("/ask-gpt", {
    
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, answerCount })
  });

  const data = await res.json();
  let qData;
  try {
    qData = JSON.parse(data.questionData);
  } catch (err) {
    alert("Could not load question.");
    return;
  }

  previousQuestions.push(qData.question);
  displayQuestion(qData);
}

function displayQuestion(q) {
  loadingScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  document.getElementById("homeBtn").classList.remove("hidden");

  document.getElementById("questionText").textContent = q.question;
  document.getElementById("questionCounter").textContent = `Question ${current + 1} of ${totalQuestions}`;
  document.getElementById("extraInfo").textContent = "";

  const answerDiv = document.getElementById("answers");
  answerDiv.innerHTML = "";
  const shuffled = [...q.choices].sort(() => 0.5 - Math.random());

  shuffled.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.classList.add("answer-button");
    btn.onclick = () => {
      if (answered) return;
      answered = true;
      if (choice === q.correct) {
        btn.classList.add("correct");
        correct++;
        document.getElementById("correctCount").textContent = `✅ ${correct}`;
      } else {
        btn.classList.add("incorrect");
        wrong++;
        document.getElementById("wrongCount").textContent = `❌ ${wrong}`;
      }
      Array.from(answerDiv.children).forEach(b => b.disabled = true);
      document.getElementById("extraInfo").innerHTML = `<strong>Fun Fact:</strong> ${q.funFact || "None provided."}`;
    };
    answerDiv.appendChild(btn);
  });
}

document.getElementById("nextBtn").onclick = () => {
  if (!answered) return;
  current++;
  if (current >= totalQuestions) endGame();
  else fetchAndShowNextQuestion();
};

function endGame() {
  gameScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");

  const message = correct >= totalQuestions / 2
    ? "🎉 Congratulations!"
    : "😅 Better luck next time!";
  document.getElementById("finalMessage").textContent = message;
  document.getElementById("finalScore").textContent = `You got ${correct} out of ${totalQuestions} correct.`;
}

document.getElementById("hintBtn").onclick = async () => {
  const questionText = document.getElementById("questionText").textContent;
  const prompt = `Give me a hint for this trivia question: "${questionText}"`;
  
    const prompt = `Generate a new multiple-choice trivia question in the category "${category}" with ${answerCount} options. Do NOT repeat or closely resemble any of these:
${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
Format the result as JSON with fields: question, choices[], correct, funFact.`;

    const res = await fetch("/ask-gpt", {
    
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, answerCount: 1, prompt })
  });
  const data = await res.json();
  document.getElementById("extraInfo").textContent = data.questionData;
};

document.getElementById("playAgainBtn").onclick = () => {
  homeScreen.classList.remove("hidden");
  document.getElementById("homeBtn").classList.add("hidden");
  endScreen.classList.add("hidden");
};

document.getElementById("homeBtn").onclick = () => {
  homeScreen.classList.remove("hidden");
  document.getElementById("homeBtn").classList.add("hidden");
  gameScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  loadingScreen.classList.add("hidden");
};
