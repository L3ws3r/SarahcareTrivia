
const presetCategories = [
  "Movies", "Classic TV", "Music", "Presidents", "History", "Science",
  "Sports", "Animals", "Food", "Geography", "Famous People", "Cars",
  "Holidays", "Cartoons", "80s", "90s", "Disney", "Broadway", "Landmarks", "Inventions"
];

let questions = [];
let current = 0;
let correct = 0;
let wrong = 0;
let answerCount = 4;

const app = document.getElementById("app");
const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");

const loadingScreen = document.createElement("div");
loadingScreen.id = "loadingScreen";
loadingScreen.classList.add("hidden");
loadingScreen.innerHTML = `<h2>Generating your trivia questions...</h2><p>Please wait a moment 🧠</p>`;
app.appendChild(loadingScreen);

document.getElementById("presetCategories").innerHTML =
  presetCategories.map(cat => `<button class="categoryBtn">${cat}</button>`).join("");

// Start game from preset category
document.getElementById("presetCategories").addEventListener("click", async (e) => {
  if (e.target.classList.contains("categoryBtn")) {
    const category = e.target.textContent;
    document.getElementById("customCategory").value = category;
    await startGame(category);
  }
});

// Start game from custom text category via Enter key
document.getElementById("customCategory").addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const category = e.target.value.trim();
    if (category) await startGame(category);
  }
});

async function startGame(category) {
  const count = document.querySelector('input[name="count"]:checked').value;
  answerCount = parseInt(document.querySelector('input[name="choices"]:checked').value);
  const theme = document.getElementById("themePicker").value;

  document.body.className = theme;

  homeScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  loadingScreen.classList.remove("hidden");

  const prompt = `Generate ${count} multiple-choice trivia questions in the category "${category}". Each question should include one correct answer, ${answerCount - 1} plausible wrong answers, and a fun fact. Format as JSON with fields: question, choices[], correct, funFact.`;

  const res = await fetch("/ask-gpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  try {
    questions = JSON.parse(data.answer);
  } catch (e) {
    alert("Error loading questions. Try again.");
    homeScreen.classList.remove("hidden");
    loadingScreen.classList.add("hidden");
    return;
  }

  current = correct = wrong = 0;
  document.getElementById("correctCount").textContent = `✅ 0`;
  document.getElementById("wrongCount").textContent = `❌ 0`;

  loadingScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  showQuestion();
}

function showQuestion() {
  const q = questions[current];
  document.getElementById("questionText").textContent = q.question;
  document.getElementById("questionCounter").textContent = `Question ${current + 1} of ${questions.length}`;
  document.getElementById("extraInfo").textContent = "";

  const answerDiv = document.getElementById("answers");
  answerDiv.innerHTML = "";
  const shuffled = [...q.choices].sort(() => 0.5 - Math.random());

  shuffled.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.classList.add("answer-button");
    btn.onclick = () => {
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
      setTimeout(() => {
        current++;
        if (current >= questions.length) endGame();
        else showQuestion();
      }, 1500);
    };
    answerDiv.appendChild(btn);
  });
}

function endGame() {
  gameScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");

  const message = correct >= questions.length / 2
    ? "🎉 Congratulations!"
    : "😅 Better luck next time!";
  document.getElementById("finalMessage").textContent = message;
  document.getElementById("finalScore").textContent = `You got ${correct} out of ${questions.length} correct.`;
}

document.getElementById("hintBtn").onclick = async () => {
  const q = questions[current];
  const prompt = `Give me a hint for this trivia question: "${q.question}"`;
  const res = await fetch("/ask-gpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  const data = await res.json();
  document.getElementById("extraInfo").textContent = data.answer;
};

document.getElementById("factBtn").onclick = () => {
  const fact = questions[current].funFact || "No fun fact provided.";
  document.getElementById("extraInfo").textContent = fact;
};

document.getElementById("nextBtn").onclick = () => {
  current++;
  if (current >= questions.length) endGame();
  else showQuestion();
};

document.getElementById("playAgainBtn").onclick = () => {
  homeScreen.classList.remove("hidden");
  endScreen.classList.add("hidden");
};

document.getElementById("homeBtn").onclick = () => {
  homeScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  loadingScreen.classList.add("hidden");
};
