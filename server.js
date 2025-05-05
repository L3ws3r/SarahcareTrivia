const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json()); // This lets you read JSON bodies in POST requests

// Serve static files from the public folder
app.use(express.static('public'));

// ✅ This is the new API endpoint you need to paste in
app.post('/api/trivia', (req, res) => {
  const { category, count } = req.body;

  // Dummy sample questions — replace with real logic later
  const sampleQuestions = Array.from({ length: count }, (_, i) => ({
    question: `Sample question ${i + 1} in category "${category}"`,
    choices: ['A', 'B', 'C', 'D'],
    answer: 'A'
  }));

  res.json(sampleQuestions);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
