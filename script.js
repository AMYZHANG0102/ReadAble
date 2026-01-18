// Variables
const card = document.getElementById("card");
const sections = [
  { text: "Section 1: The quick brown fox jumps over the lazy dog.", explanation: "This section is about a fox and a dog." },
  { text: "Section 2: Lorem ipsum dolor sit amet, consectetur adipiscing elit.", explanation: "This is placeholder text often used in design." },
  { text: "Section 3: Reading accessibility improves comprehension and learning.", explanation: "Accessibility tools help everyone read better." }
];
let magnifier = false;
let dyslexicFont = false;
let speechText = false;
const VOICE_ID = "ljX1ZrXuDIIRVcmiVSyR"

// Render Sections
function renderSections(sections) {
  card.innerHTML = "";

  sections.forEach((section) => {
    const sectionCard = document.createElement("div");
    sectionCard.className = "reading-card";

    const textEl = document.createElement("p");
    textEl.className = "section-text";
    textEl.innerText = section.text;

    const helpBtn = document.createElement("span");
    helpBtn.className = "help-btn";
    helpBtn.innerText = "?";

    const explanation = document.createElement("div");
    explanation.className = "explanation";
    explanation.innerText = section.explanation;
    explanation.style.display = "none";

    helpBtn.addEventListener("mouseenter", () => {
      explanation.style.display = "block";
    });

    helpBtn.addEventListener("mouseleave", () => {
      explanation.style.display = "none";
    });

    sectionCard.appendChild(helpBtn);
    sectionCard.appendChild(textEl);
    sectionCard.appendChild(explanation);

    card.appendChild(sectionCard);
  });
}

renderSections(sections);

// Magnifier
document.addEventListener("mousemove", (e) => {
  if (!magnifier) return;

  const target = e.target;
  if (target.classList.contains("section-text")) {
    target.style.fontSize = "1.5em";
  }
});

document.addEventListener("mouseout", (e) => {
  if (!magnifier) return;

  const target = e.target;
  if (target.classList.contains("section-text")) {
    target.style.fontSize = "";
  }
});

// Dyslexic-Friendly Font
function toggleDyslexicFont() {
  if (dyslexicFont) {
    document.body.classList.add("dyslexic-font");
  } else {
    document.body.classList.remove("dyslexic-font");
  }
}

// Text-to-Speech
async function speakText(text) {
  if (!speechText) return;
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVEN_API_KEY
    },
    body: JSON.stringify({ text: text, voice_settings: { stability: 0.5, similarity_boost: 0.5 } })
  });

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}

// Event Listeners for toggles
document.getElementById("magnifierToggle").addEventListener("change", (e) => {
  magnifier = e.target.checked;
});

document.getElementById("dyslexicToggle").addEventListener("change", (e) => {
  dyslexicFont = e.target.checked;
  toggleDyslexicFont();
});

document.getElementById("speechToggle").addEventListener("change", (e) => {
  speechText = e.target.checked;
});

// Click to speak text
card.addEventListener("click", (e) => {
  if (e.target.classList.contains("section-text")) {
    speakText(e.target.innerText);
  }
});
