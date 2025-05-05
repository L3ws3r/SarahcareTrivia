async function generateTrivia() {
  const category = document.querySelector('input[type="text"]').value || 'General';
  const count = parseInt(document.querySelector('select').value || '10', 10);

  try {
    const response = await fetch('https://sarahcare-trivia.onrender.com/api/trivia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, count }),
    });

    if (!response.ok) throw new Error('Invalid response');

    const questions = await response.json();
    console.log('Questions:', questions); // For now

    // TODO: display them on screen — would you like help with that next?
  } catch (err) {
    console.error('Trivia fetch failed:', err);
  }
}
