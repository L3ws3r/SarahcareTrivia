// shortcuts
const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];

// screen toggles
const mainS = $('#mainScreen');
const settingsS = $('#settingsScreen');
$('#settingsBtn').onclick = () => {
  mainS.classList.add('hidden');
  settingsS.classList.remove('hidden');
};
$('#backBtn').onclick = () => {
  settingsS.classList.add('hidden');
  mainS.classList.remove('hidden');
};

// swatch handling
$$('.bg-swatches .swatch').forEach(btn => {
  btn.onclick = () => {
    $$('.bg-swatches .swatch').forEach(s=>s.classList.remove('selected'));
    btn.classList.add('selected');
    document.body.style.background = btn.dataset.bg;
  };
});
$$('.btn-swatches .swatch').forEach(btn => {
  btn.onclick = () => {
    $$('.btn-swatches .swatch').forEach(s=>s.classList.remove('selected'));
    btn.classList.add('selected');
    document.documentElement.style.setProperty('--btn-bg', btn.dataset.btn);
  };
});

// apply button CSS var
const style = document.createElement('style');
style.textContent = `
  .big-btn { background: var(--btn-bg, #007BFF) !important; }
`;
document.head.append(style);

// clear history stub
$('#clearHistory').onclick = () => {
  localStorage.removeItem('usedQuestions');
  alert('Question history cleared!');
};

// start form stub
$('#startForm').onsubmit = e => {
  e.preventDefault();
  alert('Starting trivia…');
};
