document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#trivia-form');
  const questionList = document.querySelector('#question-list');
  const loading = document.querySelector('#loading');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.querySelector('#category').value;
    const count = document.querySelector('#count').value;

    questionList.innerHTML = '';
    loading.style.display = 'block';

    try {
      const res = await fetch('/api/trivia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, count: Number(count) })
      });

      const data = await res.json();
      loading.style.display = 'none';

      if (data.error) {
        questionList.innerHTML = `<p class="text-red-500">${data.error}</p>`;
        return;
      }

      data.questions.forEach((q, i) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'my-6 p-4 border rounded shadow';

        const img = document.createElement('img');
        img.src = q.image;
        img.alt = q.question;
        img.className = 'w-full h-60 object-cover mb-2';

        const question = document.createElement('h3');
        question.textContent = `${i + 1}. ${q.question}`;
        question.className = 'font-semibold mb-2';

        const ul = document.createElement('ul');
        q.choices.forEach(choice => {
          const li = document.createElement('li');
          li.textContent = choice;
          li.className = 'hover:bg-blue-100 cursor-pointer px-2 py-1 rounded';
          li.addEventListener('click', () => {
            if (choice === q.answer) {
              li.classList.add('bg-green-300');
            } else {
              li.classList.add('bg-red-300');
            }
          });
          ul.appendChild(li);
        });

        qDiv.appendChild(img);
        qDiv.appendChild(question);
        qDiv.appendChild(ul);
        questionList.appendChild(qDiv);
      });

    } catch (err) {
      console.error(err);
      loading.style.display = 'none';
      questionList.innerHTML = `<p class="text-red-500">Error fetching trivia questions. Try again later.</p>`;
    }
  });
});
