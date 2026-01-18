// VARIABLES:
const currentCard = document.getElementById("current-card");
const readStack = document.getElementById("read-stack");
let currentCardIndex = 0;
let speechText = false;
let magnifier = false;
let dyslexicFont = false;
const VOICE_ID = "ljX1ZrXuDIIRVcmiVSyR"
const sections = [
  { text: "Section 1: The quick brown fox jumps over the lazy dog.", explanation: "This section is about a fox and a dog." },
  { text: "Section 2: Lorem ipsum dolor sit amet, consectetur adipiscing elit.", explanation: "This is placeholder text often used in design." },
  { text: "Section 3: Reading accessibility improves comprehension and learning.", explanation: "Accessibility tools help everyone read better." }
];

// FUNCTIONS:

// Render a single card
function createCard(section) {
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

  helpBtn.addEventListener("mouseenter", () => { explanation.style.display = "block"; });
  helpBtn.addEventListener("mouseleave", () => { explanation.style.display = "none"; });

  sectionCard.appendChild(helpBtn);
  sectionCard.appendChild(textEl);
  sectionCard.appendChild(explanation);

  return sectionCard;
}

//Show current card
function showCard(index) {
  currentCard.innerHTML = "";
  if (index >= sections.length) return; // Done

  const card = createCard(sections[index]);
  currentCard.appendChild(card);
  // Automatically read if TTS is enabled
  if (speechText) readCurrentCard(card);
}

// Read current card using TTS
async function readCurrentCard(card) {
  const text = card.querySelector(".section-text").innerText;
  const response = await fetch("/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voiceId: VOICE_ID
    })
  });

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  audio.onended = () => {
    // When done, stack the card and show next
    readStack.appendChild(card);
    currentCardIndex++;
    showCard(currentCardIndex);
  };

  audio.play();
}

// Magnifier
const magnifierLens = document.getElementById("magnifierLens");
const zoomLevel = 2;

document.addEventListener("mousemove", (e) => {
  if (!magnifier) {
    magnifierLens.style.display = "none";
    return;
  }

  const target = e.target;
  if (target.classList.contains("section-text")) {
    magnifierLens.style.display = "block";

    // Get cursor position relative to the text
    const rect = target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // Position the lens around the cursor
    magnifierLens.style.left = e.pageX - magnifierLens.offsetWidth / 2 + "px";
    magnifierLens.style.top = e.pageY - magnifierLens.offsetHeight / 2 + "px";

    // Create zoomed text inside the lens
    magnifierLens.innerHTML = `<div class="magnifier-text">${target.innerText}</div>`;

    const zoomText = magnifierLens.querySelector(".magnifier-text");
    zoomText.style.left = -offsetX * zoomLevel + magnifierLens.offsetWidth / 2 + "px";
    zoomText.style.top = -offsetY * zoomLevel + magnifierLens.offsetHeight / 2 + "px";

  } else {
    magnifierLens.style.display = "none";
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

// EVENT LISTENERS FOR TOGGLES:
document.getElementById("magnifierToggle").addEventListener("change", (e) => {
  magnifier = e.target.checked;
});

document.getElementById("dyslexicToggle").addEventListener("change", (e) => {
  dyslexicFont = e.target.checked;
  toggleDyslexicFont();
});

document.getElementById("speechToggle").addEventListener("change", e => {
  speechText = e.target.checked;
  // If TTS is enabled mid-way, read current card
  if (speechText && currentCardIndex < sections.length) {
    const activeCard = currentCard.querySelector(".reading-card");
    if (activeCard) readCurrentCard(activeCard);
  }
});

// LOAD FIRST CARD:
showCard(currentCardIndex);