
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('#bg-options .color-option').forEach(function(option) {
    option.addEventListener('click', function() {
      localStorage.setItem('bgColor', this.dataset.color);
      document.body.style.backgroundColor = this.dataset.color;
    });
  });

  document.querySelectorAll('#button-options .color-option').forEach(function(option) {
    option.addEventListener('click', function() {
      localStorage.setItem('buttonColor', this.dataset.color);
      document.querySelectorAll('button').forEach(btn => {
        btn.style.backgroundColor = localStorage.getItem('buttonColor');
      });
    });
  });

  const storedBg = localStorage.getItem('bgColor');
  if (storedBg) document.body.style.backgroundColor = storedBg;

  const storedBtn = localStorage.getItem('buttonColor');
  if (storedBtn) {
    document.querySelectorAll('button').forEach(btn => {
      btn.style.backgroundColor = storedBtn;
    });
  }
});
