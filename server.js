/* --- server.js duplicate answer shield edition --- */
import express from 'express';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import { tokenize, jaccard, leaksAnswer, shuffle } from './utils.js';

const app = express();
app.use(express.json());

const ALLOWED = [/^https?:\/\/localhost(:\d+)?$/, /^https?:\/\/sarahcare-cs\.com$/];
app.use(cors({ origin: (o,cb)=>cb(null, ALLOWED.some(r=>r.test(o||''))) }));

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
const MAX_TRIES = 6;

function dupAns(ans, seen){
  if(!seen?.length) return false;
  return seen.some(a=>a.toLowerCase() === ans.toLowerCase());
}

app.post('/trivia-question', async (req,res)=>{
  const { category = 'General', style='fun', seen = [], seenAnswers = [] } = req.body || {};
  const sysPrompt = `
You are a trivia generator for seniors. Do NOT repeat these answers: ${seenAnswers.join(', ')}.
Do NOT repeat any of these question wordings either:
${seen.join('\n')}
Return a JSON object {question, correct, distractors}. Avoid leaking the answer in the question text.`;

  for(let i=0;i<MAX_TRIES;i++){
    const completion = await openai.createChatCompletion({
      model:'gpt-4o',
      messages:[
        {role:'system', content:sysPrompt},
        {role:'user', content:`Give me one ${style} ${category} trivia question for seniors with 3 distractors.`}
      ],
      response_format:{type:'json_object'}
    });
    let data;
    try{
      data = JSON.parse(completion.data.choices[0].message.content);
    }catch(e){ continue; }

    if(leaksAnswer(data.question, data.correct)) continue;
    if(jaccard(data.question, seen) > 0.6) continue;
    if(dupAns(data.correct, seenAnswers)) continue;

    data.answers = shuffle([data.correct, ...data.distractors]);
    return res.json(data);
  }

  // fallback
  return res.json({
    question: 'Which planet is known as the Red Planet?',
    correct: 'Mars',
    distractors: ['Venus','Jupiter','Mercury'],
    answers: shuffle(['Mars','Venus','Jupiter','Mercury'])
  });
});

app.listen(process.env.PORT || 3000, ()=>console.log('Trivia server running'));
