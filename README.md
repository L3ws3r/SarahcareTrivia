# SarahCare Trivia Backend

## Setup

1. Create a `.env` file in the root:
   \`\`\`
   OPENAI_API_KEY=your_openai_api_key_here
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Start the server:
   \`\`\`
   npm start
   \`\`\`

The server listens on the port defined by `PORT` (default 3000).

### Endpoint

**POST** `/ask`

- Request body (JSON):
  ```json
  {
    "category": "General",
    "answerCount": 4
  }
  ```

- Response:
  ```json
  {
    "question": "Sample question?",
    "answers": ["A", "B", "C", "D"],
    "correctIndex": 2
  }
  ```
