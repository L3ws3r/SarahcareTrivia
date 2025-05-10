const bgColors = ['#ffffff','#f5f5f5','#333333','#007bff','#28a745','#ffc107'];
const btnColors = ['#007bff','#6c757d','#28a745','#dc3545','#ffc107','#17a2b8'];

function createSwatches(colors, containerId, storageKey, applyFunc) {
  const container = document.getElementById(containerId);
  colors.forEach(color => {
    const sw = document.createElement('div');
    sw.classList.add('swatch');
    sw.style.backgroundColor = color;
    if (localStorage.getItem(storageKey) === color) sw.classList.add('selected');
    sw.addEventListener('click', () => {
      document.querySelectorAll(`#${containerId} .swatch`).forEach(x => x.classList.remove('selected'));
      sw.classList.add('selected');
      localStorage.setItem(storageKey, color);
      applyFunc(color);
    });
    container.appendChild(sw);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize or set defaults
  if (!localStorage.getItem('bgColor')) localStorage.setItem('bgColor', bgColors[0]);
  if (!localStorage.getItem('btnColor')) localStorage.setItem('btnColor', btnColors[0]);

  const applyBackground = color => document.body.style.backgroundColor = color;
  const applyButton = color => document.documentElement.style.setProperty('--btn', color);

  applyBackground(localStorage.getItem('bgColor'));
  applyButton(localStorage.getItem('btnColor'));

  createSwatches(bgColors, 'backgroundSwatches', 'bgColor', applyBackground);
  createSwatches(btnColors, 'buttonSwatches', 'btnColor', applyButton);

  // Optional: hook up clearHistory/back handlers
  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    // clear question history logic here...
    alert('History cleared!');
  });
  document.getElementById('backBtn').addEventListener('click', () => {
    // navigate back...
    window.history.back();
  });
});
