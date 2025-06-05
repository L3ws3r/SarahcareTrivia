export function tokenize(str) {
  return str.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
}

export function jaccard(a, b) {
  const A = new Set(tokenize(a));
  const B = new Set(tokenize(b));
  const intersection = [...A].filter(x => B.has(x)).length;
  return intersection / (A.size + B.size - intersection || 1);
}

export function leaksAnswer(question, answer) {
  const qTokens = tokenize(question);
  return tokenize(answer).some(t => qTokens.includes(t));
}

export function shuffle(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}