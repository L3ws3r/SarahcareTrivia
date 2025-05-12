# SarahCare Trivia Backend

## Setup

1. Create an `.env` file in the root:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

The server will listen on the port specified in the `PORT` environment variable (default: 3000).

## Endpoint

- **POST /ask**

  Request body:
  ```json
  {
    "category": "General",
    "answerCount": 4
  }
  ```

  Response:
  ```json
  {
    "question": "Your generated question?",
    "answers": ["A", "B", "C", "D"],
    "correctIndex": 2
  }
  ```
