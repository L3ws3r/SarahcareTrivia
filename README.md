# SarahCare Senior Trivia 🎉

A senior-friendly trivia web app built for use on iPads and TVs at adult day care centers.

## 🚀 Features

- Powered by GPT-4 via OpenAI API
- One question at a time with large, bold UI
- Categories: pick from preset or type your own
- Answer with 4 or 5 options
- Hint and Fun Fact buttons
- Final score screen with humor
- Upload custom questions (coming soon)
- Theme picker for visibility

## 📦 Tech Stack

- Node.js + Express
- Vanilla JS frontend
- Tailored for seniors: bold fonts, big buttons, max-width layout
- OpenAI for trivia generation

## 🛠️ Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/L3ws3r/SarahcareTrivia.git
   cd SarahcareTrivia
   ```

2. Add your OpenAI key:
   Create a `.env` file:
   ```
   OPENAI_API_KEY=your-key-here
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the app:
   ```bash
   node server.js
   ```

App will run at: `http://localhost:3000`

## 🧠 Trivia Generation

Backend sends a prompt to ChatGPT:
- “Generate 10 trivia questions about Movies with 4 choices and a fun fact...”
