
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('#bg-options .color-option').forEach(function(option) {
    option.addEventListener('click', function() {
      document.body.style.backgroundColor = this.dataset.color;
      localStorage.setItem('bgColor', this.dataset.color);
    });
  });

  document.querySelectorAll('#button-options .color-option').forEach(function(option) {
    option.addEventListener('click', function() {
      localStorage.setItem('buttonColor', this.dataset.color);
      document.querySelectorAll('button').forEach(function(btn) {
        btn.style.backgroundColor = localStorage.getItem('buttonColor');
      });
    });
  });

  // Apply stored colors
  const storedBgColor = localStorage.getItem('bgColor');
  if (storedBgColor) {
    document.body.style.backgroundColor = storedBgColor;
  }

  const storedButtonColor = localStorage.getItem('buttonColor');
  if (storedButtonColor) {
    document.querySelectorAll('button').forEach(function(btn) {
      btn.style.backgroundColor = storedButtonColor;
    });
  }
});
