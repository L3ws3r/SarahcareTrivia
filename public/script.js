// 🔍 Function to test DuckDuckGo image search
async function testDuckDuckGoImageSearch(query) {
  try {
    const res = await fetch(`/api/images?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    const imgUrl = data.image || 'https://upload.wikimedia.org/wikipedia/commons/6/65/Big_question_mark.svg';

    const img = document.createElement('img');
    img.src = imgUrl;
    img.alt = query;
    img.style.maxWidth = '300px';
    img.style.border = '2px solid #ccc';

    const output = document.getElementById('imageTestOutput');
    output.innerHTML = ''; // Clear previous
    output.appendChild(img);
  } catch (err) {
    console.error('DuckDuckGo Image Test Failed:', err);
  }
}

// 🧠 Placeholder for Trivia game logic (to be implemented later)
async function fetchTriviaQuestions(category = 'General', count = 5) {
  try {
    const res = await fetch('/api/trivia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, count })
    });

    const data = await res.json();
    console.log(data.questions); // TODO: Render questions in the UI
  } catch (err) {
    console.error('Failed to load trivia questions:', err);
  }
}
