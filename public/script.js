let currentQuestionIndex = 0;
let triviaQuestions = [];

document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('customCategory').value = btn.dataset.category;
  });
});

document.getElementById('generateBtn').addEventListener('click', async () => {
  const category = document.getElementById('customCategory').value.trim() || 'General';
  try {
    const res = await fetch('/api/trivia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category })
    });
    const data = await res.json();
    if (!res.ok || !data.questions) throw new Error('Invalid response');
    triviaQuestions = data.questions;
    currentQuestionIndex = 0;
    showQuestion();
  } catch (err) {
    console.error('Trivia fetch failed:', err);
    alert('Error fetching trivia.');
  }
});

function showQuestion() {
  const container = document.getElementById('trivia-container');
  container.innerHTML = '';

  if (currentQuestionIndex >= triviaQuestions.length) {
    container.innerHTML = `<div class="alert alert-info">You’ve completed all the questions!</div>`;
    return;
  }

  const { question, choices } = triviaQuestions[currentQuestionIndex];

  const card = document.createElement('div');
  card.className = 'card p-4';

  const qText = document.createElement('h5');
  qText.innerText = `Q${currentQuestionIndex + 1}: ${question}`;
  card.appendChild(qText);

  choices.forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-primary d-block w-100 my-2';
    btn.innerText = choice;
    btn.onclick = () => {
      currentQuestionIndex++;
      showQuestion();
    };
    card.appendChild(btn);
  });

  container.appendChild(card);
}
