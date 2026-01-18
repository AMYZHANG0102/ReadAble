// VARIABLES:
const currentCard = document.getElementById("current-card");
const readStack = document.getElementById("read-stack");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const replayBtn = document.getElementById("replayBtn");

let currentCardIndex = 0;
let magnifier = false;
let dyslexicFont = false;

const VOICE_ID = "ljX1ZrXuDIIRVcmiVSyR"
let audio = null; // Global audio object
let isPaused = false;

const readingMetrics = {
  cardStartTime: null,
  replayCount: 0,
  pauseCount: 0,
  avgReadingTime: [],
  speechRate: 1.0
};

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

// Show current card
function showCard(index) {
  currentCard.innerHTML = "";
  if (index >= sections.length) return;

  const cardEl = createCard(sections[index]);
  currentCard.appendChild(cardEl);
}

// HELPER: Toggle between Simple and Original Text
function toggleSimpleMode(card, forceSimple = false) {
    const textEl = card.querySelector(".section-text");
    const isSimple = card.dataset.isSimple === "true";
    
    // If we want to force simple mode (e.g. when Dyslexic font is on)
    if (forceSimple || !isSimple) {
        textEl.innerText = card.dataset.simple;
        card.dataset.isSimple = "true";
    } else {
        textEl.innerText = card.dataset.original;
        card.dataset.isSimple = "false";
    }
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

// Control narrator audio
async function playCurrentCard() {
  if (currentCardIndex >= sections.length) return; // Done

  const cardEl = currentCard.querySelector(".reading-card");
  if (!cardEl) return;

  const text = cardEl.querySelector(".section-text").innerText;

  // Resume if paused
  if (audio && isPaused) {
    audio.play();
    isPaused = false;
    return;
  }

  // Fetch TTS from server
  audio = new Audio();
  const response = await fetch("/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voiceId: VOICE_ID,
      speechRate: readingMetrics.speechRate
    })
  });

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  audio.src = audioUrl;

  audio.onended = () => {
    // Move card to read stack
    readStack.appendChild(cardEl);
    currentCardIndex++;
    showCard(currentCardIndex);
    // Auto-play next card
    playCurrentCard();
  };

  audio.play();
}

function pauseAudio() {
  if (audio && !audio.paused) {
    audio.pause();
    isPaused = true;
  }
}

function replayCard() {
  readingMetrics.replayCount++; // track replays
  // Slow speech speed rate if user replays multiple times
  if (readingMetrics.replayCount >= 2) {
    readingMetrics.speechRate = Math.max(0.85, readingMetrics.speechRate - 0.05);
  }
  stopAudio();
  playCurrentCard();
}

// Forward Navigation
function goToNextCard() {
  if (currentCardIndex < sections.length - 1) {
    stopAudio();
    currentCardIndex++;
    showCard(currentCardIndex);
  }
}

// Backward Navigation
function goToPreviousCard() {
  if (currentCardIndex > 0) {
    stopAudio();
    currentCardIndex--;
    showCard(currentCardIndex);
  }
}

// Stop audio playback
function stopAudio() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    isPaused = false;
  }
}

// EVENT LISTENERS:
document.getElementById("magnifierToggle").addEventListener("change", (e) => {
  magnifier = e.target.checked;
});

document.getElementById("dyslexicToggle").addEventListener("change", (e) => {
  dyslexicFont = e.target.checked;
  toggleDyslexicFont();
});

playBtn.addEventListener("click", playCurrentCard);
pauseBtn.addEventListener("click", pauseAudio);
replayBtn.addEventListener("click", replayCard);

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    goToNextCard();
  }
  if (e.key === "ArrowLeft") {
    goToPreviousCard();
  }
});

let scrollCooldown = false;

// Mouse wheel scrolling navigation
document.addEventListener("wheel", (e) => {
  if (scrollCooldown) return;

  if (e.deltaY > 0) {
    goToNextCard(); // scroll down
  } else {
    goToPreviousCard(); // scroll up
  }

  scrollCooldown = true;
  setTimeout(() => scrollCooldown = false, 500);
});

let touchStartX = 0;
let touchEndX = 0;

// Touch swipe navigation
document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const swipeDistance = touchEndX - touchStartX;

  if (Math.abs(swipeDistance) < 50) return; // ignore small swipes

  if (swipeDistance < 0) {
    goToNextCard(); // swipe left
  } else {
    goToPreviousCard(); // swipe right
  }
}

// LOAD FIRST CARD (INIT):
showCard(currentCardIndex);