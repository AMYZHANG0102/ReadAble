// Magnifier effect for text sections
if (magnifier) {
  document.addEventListener("mousemove", (e) => {
    const target = e.target;

    if (target.classList.contains("section-text")) {
      target.style.fontSize = "1.5em";
    }
  });

  document.addEventListener("mouseout", (e) => {
    const target = e.target;

    if (target.classList.contains("section-text")) {
      target.style.fontSize = "";
    }
  });
}

// Dyslexia-friendly font toggle
if (dyslexicFont) {
  document.body.classList.add("dyslexic-font");
} else {
  document.body.classList.remove("dyslexic-font");
}
