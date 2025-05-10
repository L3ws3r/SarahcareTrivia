
const presetCategories = [
  "Movies", "Classic TV", "Music", "Presidents", "History", "Science",
  "Sports", "Animals", "Food", "Geography", "Famous People", "Cars",
  "Holidays", "Cartoons", "80s", "90s", "Disney", "Broadway", "Landmarks", "Inventions"
];

let current = 0;
let previousQuestions = [];
let seenQuestions = new Set(JSON.parse(localStorage.getItem('seenQuestions') || '[]'));
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

  
    const dedupePrompt = `Generate a new multiple-choice trivia question in the category "${category}" with ${answerCount} options. Do NOT repeat or closely resemble any of these:
${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
Format the result as JSON with fields: question, choices[], correct, funFact.`;

    const res = await fetch("/ask-gpt", {
        const numChoices = localStorage.getItem("choiceCount") || "4";
    
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

  const questionText = qData.question.toLowerCase().trim();
  if (seenQuestions.has(questionText)) {
    console.log('Duplicate question detected. Getting another...');
    return fetchAndShowNextQuestion();
  }
  seenQuestions.add(questionText);
  localStorage.setItem('seenQuestions', JSON.stringify(Array.from(seenQuestions)));
  previousQuestions.push(qData.question);
  displayQuestion(qData);
}

function displayQuestion(q) {
  loadingScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  document.getElementById("homeBtn").classList.remove("hidden");

  document.getElementById("questionText").textContent = q.question;
  document.getElementById("answerFeedback").textContent = "";
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
      document.getElementById('answerFeedback').textContent = 'CORRECT';
      document.getElementById('answerFeedback').style.color = 'green';
      document.getElementById('answerFeedback').style.fontSize = '2em';
        document.getElementById('answerFeedback').textContent = 'CORRECT';
        document.getElementById('answerFeedback').style.color = 'green';
        document.getElementById('answerFeedback').style.fontSize = '2em';
        document.getElementById("correctCount").textContent = `✅ ${correct}`;
      } else {
        btn.classList.add("incorrect");
        wrong++;
      document.getElementById('answerFeedback').textContent = 'WRONG';
      document.getElementById('answerFeedback').style.color = 'red';
      document.getElementById('answerFeedback').style.fontSize = '2em';
        document.getElementById('answerFeedback').textContent = 'WRONG';
        document.getElementById('answerFeedback').style.color = 'red';
        document.getElementById('answerFeedback').style.fontSize = '2em';
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
  document.getElementById('answerFeedback').textContent = '';
  document.getElementById('answerFeedback').style.color = '';
  document.getElementById('answerFeedback').style.fontSize = '';
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
  let finalMessage = correct >= totalQuestions / 2 ? `<div style="font-size: 2em; margin-top: 1em;">🎉 Not bad, trivia champ! 🎉</div>` : `<div style="font-size: 2em; margin-top: 1em;">🤔 Yikes! Better luck next time. 🤪</div>`;
  document.getElementById("finalScore").innerHTML = `<div style="text-align: center;">` +
`<div style="font-size: 2em; color: green;">CORRECT ANSWERS: ${correct}</div>` +
`<div style="font-size: 2em; color: red;">WRONG ANSWERS: ${totalQuestions - correct}</div>` +
finalMessage + `</div>`;
}


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
;
}
window.onload = () => {

// Settings page navigation
document.getElementById("settingsBtn").onclick = () => {
  document.getElementById("homeScreen").classList.add("hidden");
  document.getElementById("settingsScreen").classList.remove("hidden");
};

document.getElementById("backToHomeBtn").onclick = () => {
  document.getElementById("settingsScreen").classList.add("hidden");
  document.getElementById("homeScreen").classList.remove("hidden");
};

// Clear question history
document.getElementById("clearHistoryBtn").onclick = () => {
  localStorage.removeItem("seenQuestions");
  alert("Question history cleared!");
};

};

// Settings logic wrapped safely in window.onload
window.onload = () => {
  const settingsBtn = document.getElementById("settingsBtn");
  const backBtn = document.getElementById("backToHomeBtn");
  const clearBtn = document.getElementById("clearHistoryBtn");
  const themeSelect = document.getElementById("themePicker");

  if (settingsBtn) settingsBtn.onclick = () => {
    document.getElementById("homeScreen").classList.add("hidden");
    document.getElementById("settingsScreen").classList.remove("hidden");
  };

  if (backBtn) backBtn.onclick = () => {
    document.getElementById("settingsScreen").classList.add("hidden");
    document.getElementById("homeScreen").classList.remove("hidden");
  };

  if (clearBtn) clearBtn.onclick = () => {
    localStorage.removeItem("seenQuestions");
    alert("Question history cleared!");
  };

  if (themeSelect) {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      themeSelect.value = savedTheme;
      document.body.className = savedTheme;
    }
    themeSelect.onchange = (e) => {
      const theme = e.target.value;
      localStorage.setItem("selectedTheme", theme);
      document.body.className = theme;
    };
  }
};