document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("trivia-form");
  const questionContainer = document.getElementById("question-container");
  const loadingIndicator = document.getElementById("loading");

  const categoryButtons = document.querySelectorAll(".category-btn");
  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("category").value = btn.dataset.category;
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const categoryInput = document.getElementById("category");
    const countInput = document.getElementById("count");

    if (!categoryInput || !countInput) return;

    const category = categoryInput.value.trim();
    const count = parseInt(countInput.value);

    if (!category) return alert("Please select or enter a category.");

    questionContainer.innerHTML = "";
    loadingIndicator.style.display = "block";

    try {
      const response = await fetch("https://sarahcare-trivia.onrender.com/api/trivia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, count }),
      });

      const data = await response.json();
      loadingIndicator.style.display = "none";

      let questions = data.questions || [];
      let currentIndex = 0;

      function renderQuestion(index) {
        if (index >= questions.length) {
          questionContainer.innerHTML = '<p class="lead">No more questions. 🎉</p>';
          return;
        }

        const q = questions[index];

        questionContainer.innerHTML = `
          <div class="card mb-3">
            <img src="${q.image}" class="card-img-top" alt="Related visual" onerror="this.style.display='none'">
            <div class="card-body">
              <h5 class="card-title">${q.question}</h5>
              ${q.choices.map(choice =>
                `<button class="btn btn-outline-primary m-1 answer-btn">${choice}</button>`
              ).join('')}
            </div>
          </div>
          <button id="next-btn" class="btn btn-success mt-2">Next</button>
        `;

        document.querySelector("#next-btn").addEventListener("click", () => {
          renderQuestion(++currentIndex);
        });

        document.querySelectorAll(".answer-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const isCorrect = btn.innerText === q.answer;
            btn.classList.remove("btn-outline-primary");
            btn.classList.add(isCorrect ? "btn-success" : "btn-danger");
          });
        });
      }

      renderQuestion(currentIndex);

    } catch (err) {
      loadingIndicator.style.display = "none";
      questionContainer.innerHTML = `<p class="text-danger">Error: ${err.message}</p>`;
      console.error("Trivia error:", err);
    }
  });
});
