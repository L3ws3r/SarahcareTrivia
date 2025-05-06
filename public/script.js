// 🔍 DuckDuckGo Image Search Tester with fallback
async function testDuckDuckGoImageSearch(query) {
  if (!query || query.trim().length < 3) {
    alert("Please enter a valid search term.");
    return;
  }

  try {
    const res = await fetch(`/api/images?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    const imgUrl = data.image || 'https://upload.wikimedia.org/wikipedia/commons/6/65/Big_question_mark.svg';

    const output = document.getElementById('imageTestOutput');
    output.innerHTML = ''; // Clear old content

    const img = document.createElement('img');
    img.src = imgUrl;
    img.alt = query;
    img.style.maxWidth = '300px';
    img.style.border = '2px solid #ccc';

    // If the image fails to load, fallback to question mark icon
    img.onerror = () => {
      img.src = 'https://upload.wikimedia.org/wikipedia/commons/6/65/Big_question_mark.svg';
    };

    output.appendChild(img);
  } catch (err) {
    console.error('DuckDuckGo Image Test Failed:', err);
    alert('Image lookup failed. Try a different term.');
  }
}

// 🧠 Trivia fetch function (UI rendering still needs to be built)
async function fetchTriviaQuestions(category = 'General', count = 5) {
  try {
    const res = await fetch('/api/trivia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, count })
    });

    const data = await res.json();
    console.log(data.questions); // TODO: Build UI to show one question at a time
  } catch (err) {
    console.error('Failed to load trivia questions:', err);
  }
}
