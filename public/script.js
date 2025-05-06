document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#trivia-form');
  const categoryInput = document.querySelector('#category');
  const countInput = document.querySelector('#count');
  const loading = document.querySelector('#loading');
  const questionContainer = document.querySelector('#question-container');
  const categoryButtons = document.querySelectorAll('.category-btn');

  // Hook up the category buttons
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryInput.value = btn.dataset.category;
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = categoryInput.value;
    const count = countInput.value || 5;

    loading.style.display = 'block';
    questionContainer.innerHTML = '';

    try {
      const res = await fetch('https://sarahcare-trivia.onrender.com/api/trivia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, count })
      });

      const data = await res.json();
      if (data.questions) {
        data.questions.forEach(q => {
          const div = document.createElement('div');
          div.className = 'card mb-3';
          div.innerHTML = `
            <img src="${q.image}" class="card-img-top" alt="Related visual" onerror="this.style.display='none'">
            <div class="card-body">
              <h5 class="card-title">${q.question}</h5>
              ${q.choices.map(choice =>
                `<button class="btn btn-outline-primary m-1">${choice}</button>`
              ).join('')}
            </div>
          `;
          questionContainer.appendChild(div);
        });
      } else {
        questionContainer.innerHTML = '<p>Failed to load trivia questions.</p>';
      }
    } catch (err) {
      console.error('Fetch error:', err);
      questionContainer.innerHTML = '<p>Error fetching trivia questions.</p>';
    } finally {
      loading.style.display = 'none';
    }
  });
});
