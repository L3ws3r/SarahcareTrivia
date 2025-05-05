const customCategoryInput = document.getElementById('customCategory');
const generateBtn = document.getElementById('generateBtn');
const questionContainer = document.getElementById('trivia-container');

let currentQuestionIndex = 0;
let questions = [];

document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    customCategoryInput.value = btn.dataset.category;
  });
});

generateBtn.addEventListener('click', async () => {
  const category = customCategoryInput.value.trim();
  if (!category) return;

  questionContainer.innerHTML = '<p>Loading questions...</p>';

  try {
    const response = await fetch('/api/trivia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, count: 10 }),
    });

    const data = await response.json();
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Invalid trivia data");
    }

    questions = data.questions;
    currentQuestionIndex = 0;
    showQuestion();
  } catch (err) {
    questionContainer.innerHTML = `<p class="text-danger">Trivia fetch failed: ${err.message}</p>`;
  }
});

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
      btn.classList.remove('btn-outline-primary');
      btn.classList.add(choice === q.answer ? 'btn-success' : 'btn-danger');

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

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
