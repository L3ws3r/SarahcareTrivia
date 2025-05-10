// grab UI elements
const homeBtn        = document.getElementById('homeBtn');
const settingsBtn    = document.getElementById('settingsBtn');
const mainScreen     = document.getElementById('mainScreen');
const settingsScreen = document.getElementById('settingsScreen');
const backBtn        = document.getElementById('backBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

const bgSwatches  = document.getElementById('bgSwatches').children;
const btnSwatches = document.getElementById('btnSwatches').children;

// toggle screen helper
function showSettings(show) {
  mainScreen.classList.toggle('hidden', show);
  settingsScreen.classList.toggle('hidden', !show);
}

// event wiring
settingsBtn.onclick = () => showSettings(true);
homeBtn.onclick     = () => showSettings(false);
backBtn.onclick     = () => showSettings(false);

// clear history stub
clearHistoryBtn.onclick = () => {
  localStorage.removeItem('askedQuestions');
  alert('Question history cleared.');
};

// swatch helper
function selectSwatch(group, idx) {
  Array.from(group).forEach((btn, i) => {
    btn.classList.toggle('selected', i === idx);
  });
}

// apply a color to :root
function setVar(prop, value) {
  document.documentElement.style.setProperty(prop, value);
}

// initialize both swatch groups
Array.from(bgSwatches).forEach((btn, idx) => {
  const color = btn.dataset.color;
  btn.style.background = color;
  btn.onclick = () => {
    selectSwatch(bgSwatches, idx);
    setVar('--bg-color', color);
  };
});
Array.from(btnSwatches).forEach((btn, idx) => {
  const color = btn.dataset.color;
  btn.style.background = color;
  btn.onclick = () => {
    selectSwatch(btnSwatches, idx);
    setVar('--btn-color', color);
  };
});

// pick defaults (first swatches)
selectSwatch(bgSwatches, 0);
selectSwatch(btnSwatches, 0);
setVar('--bg-color', bgSwatches[0].dataset.color);
setVar('--btn-color', btnSwatches[0].dataset.color);
