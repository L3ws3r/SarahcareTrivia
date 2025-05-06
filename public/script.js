const form = document.getElementById('category-form');
const categorySelect = document.getElementById('category');
const customCategoryInput = document.getElementById('custom-category');
const questionContainer = document.getElementById('question-container');
const loadingIndicator = document.getElementById('loading');

let currentQuestionIndex = 0;
let questions = [];

// 🔄 Form submit triggers trivia generation
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const selectedCategory = categorySelect.value === 'custom'
    ? customCategoryInput.value.trim()
    : categorySelect.value;

  if (!selectedCategory) return;

  loadingIndicator.style.display = 'block';
  questionContainer.innerHTML = '';

  try {
    const response = await fetch('/api/trivia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: selectedCategory, count: 10 }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("🚨 Server error:", response.status, text);
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Invalid trivia data");
    }

    questions = data.questions;
    currentQuestionIndex = 0;
    showQuestion();
  } catch (err) {
    console.error("⚠️ Trivia fetch failed:", err.message);
    questionContainer.innerHTML = `<p class="text-danger">Trivia fetch failed: ${err.message}</p>`;
  } finally {
    loadingIndicator.style.display = 'none';
  }
});

// 🧠 Renders one question at a time
function showQuestion() {
  const q = questions[currentQuestionIndex];
  if (!q) {
    questionContainer.innerHTML = '<p class="text-success">All questions completed!</p>';
    return;
  }

  const card = document.createElement('div');
  card.className = 'card p-4';

  if (q.image) {
    const img = document.createElement('img');
    img.src = q.image;
    img.alt = 'Related visual';
    img.className = 'img-fluid mb-3';
    card.appendChild(img);
  }

  const questionText = document.createElement('h5');
  questionText.textContent = q.question;
  card.appendChild(questionText);

  const choices = shuffleArray([...q.choices]);
  choices.forEach((choice) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-primary m-2';
    btn.textContent = choice;
    btn.onclick = () => {
      if (choice === q.answer) {
        btn.classList.replace('btn-outline-primary', 'btn-success');
      } else {
        btn.classList.replace('btn-outline-primary', 'btn-danger');
      }

      setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
      }, 1000);
    };
    card.appendChild(btn);
  });

  questionContainer.innerHTML = '';
  questionContainer.appendChild(card);
}

// 🔀 Utility to randomize answers
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
