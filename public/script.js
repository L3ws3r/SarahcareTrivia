async function generateTrivia() {
  const category = document.querySelector('input[type="text"]').value || 'General';
  const count = parseInt(document.querySelector('select').value) || 10;

  try {
    const res = await fetch('/api/trivia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, count })
    });

    const questions = await res.json();

    const container = document.getElementById('trivia-container');
    container.innerHTML = ''; // clear previous content

    questions.forEach((q, i) => {
      const div = document.createElement('div');
      div.classList.add('question');
      div.innerHTML = `<strong>Q${i + 1}:</strong> ${q.question}`;
      container.appendChild(div);
    });
  } catch (err) {
    console.error('Trivia fetch failed:', err);
  }
}
