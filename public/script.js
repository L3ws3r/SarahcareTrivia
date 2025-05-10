// grab DOM
const homeScreen = document.getElementById('homeScreen');
const settingsScreen = document.getElementById('settingsScreen');
const settingsBtn = document.getElementById('settingsBtn');
const backBtn = document.getElementById('backFromSettings');
const homeBtn = document.getElementById('homeBtn');
const bgContainer = document.getElementById('bgSwatches');
const btnContainer = document.getElementById('btnSwatches');

// color sets
const bgColors = ['#ffffff','#f8f9fa','#343a40','#007bff','#28a745','#ffc107'];
const btnColors = ['#007bff','#6c757d','#28a745','#dc3545','#ffc107','#17a2b8'];

// switch screen helpers
settingsBtn.onclick = () => {
  homeScreen.classList.add('hidden');
  settingsScreen.classList.remove('hidden');
};
backBtn.onclick = homeBtn.onclick = () => {
  settingsScreen.classList.add('hidden');
  homeScreen.classList.remove('hidden');
};

// build swatches
function buildSwatches(colors, container, cssVar) {
  colors.forEach(col => {
    const sw = document.createElement('div');
    sw.className = 'swatch';
    sw.style.backgroundColor = col;
    sw.addEventListener('click', () => {
      document.documentElement.style.setProperty(cssVar, col);
      // mark selected
      container.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
    });
    container.appendChild(sw);
  });
}

// init on load
buildSwatches(bgColors, bgContainer, '--bg-color');
buildSwatches(btnColors, btnContainer, '--btn-color');
