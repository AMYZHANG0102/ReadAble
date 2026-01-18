// VARIABLES:
const currentCard = document.getElementById("current-card");
const readStack = document.getElementById("read-stack");

let speechText = false;
let magnifier = false;
let dyslexicFont = false;
let speechSynth = window.speechSynthesis; // Browser's built-in speech
let currentCardIndex = 0;
const VOICE_ID = "ljX1ZrXuDIIRVcmiVSyR"

// Default placeholder (in case they go to /cards directly without uploading)
let sections = [
  { 
      title: "No File Loaded", 
      text: "Please go back to the Home page and upload a PDF.", 
      simple_text: "Go home and pick a file.", 
      summary: "No content available." 
  }
];

// LOAD DATA
function loadData() {
    const storedData = localStorage.getItem("readingData");
    
    if (storedData) {
        try {
            sections = JSON.parse(storedData);
        } catch (e) {
            console.error("Could not parse data", e);
        }
    }
}

// Create Card
function createCard(section) {
  const sectionCard = document.createElement("div");
  sectionCard.className = "reading-card";

  // Container
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "card-content";

  // Title
  const titleEl = document.createElement("h3");
  titleEl.className = "card-title";
  titleEl.innerText = section.title || "Section";

  // Body Text
  const textEl = document.createElement("p");
  textEl.className = "section-text";
  textEl.innerText = section.text; // Default to Original

  contentWrapper.append(titleEl, textEl);

  // Popup Menu Logic
  const helpBtn = document.createElement("span");
  helpBtn.className = "help-btn";
  helpBtn.innerText = "?";

  const popup = document.createElement("div");
  popup.className = "options-popup";

  const originalBtn = createPill("📄 Original", true);
  const simpleBtn = createPill("✨ Simplified", false);
  const summaryBtn = createPill("📝 Summary", false);

  function createPill(text, isActive) {
      const btn = document.createElement("div");
      btn.className = `option-pill ${isActive ? 'active' : ''}`;
      btn.innerText = text;
      return btn;
  }

  // Pill Click Handlers
  function resetPills() {
      [originalBtn, simpleBtn, summaryBtn].forEach(btn => btn.classList.remove("active"));
  }

  originalBtn.addEventListener("click", () => {
      resetPills();
      originalBtn.classList.add("active");
      textEl.innerText = section.text;
  });

  simpleBtn.addEventListener("click", () => {
      resetPills();
      simpleBtn.classList.add("active");
      textEl.innerText = section.simple_text || section.text;
  });

  summaryBtn.addEventListener("click", () => {
      resetPills();
      summaryBtn.classList.add("active");
      textEl.innerText = section.summary || "No summary available.";
  });

  popup.append(originalBtn, simpleBtn, summaryBtn);

  // Toggle Popup
  helpBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      popup.classList.toggle("show");
  });

  sectionCard.addEventListener("click", () => {
      popup.classList.remove("show");
  });

  sectionCard.append(helpBtn, popup, contentWrapper);
  return sectionCard;
}

// RENDER STACK (Replaces showCard)
function renderStack() {
   const container = document.getElementById("read-stack"); 
    container.innerHTML = ""; 

    sections.forEach((section, index) => {
        const card = createCard(section);
        
        // --- STACKING LOGIC ---
        // 1. Tighter Offset: 15px (looks like a deck)
        // 2. HARD LIMIT: Stop increasing offset after card #3
        //    Index 0 -> 0px
        //    Index 1 -> 15px
        //    Index 2 -> 30px
        //    Index 3, 4, 5... -> 45px (They all stick here, covering the previous ones)
        const limit = 3;
        const step = 15; 
        const offset = Math.min(index, limit) * step; 
        
        card.style.top = offset + "px"; 
        
        // Important: Ensure new cards sit ON TOP of old ones
        card.style.zIndex = index + 1;

        container.appendChild(card);
    });

    if (dyslexicFont) toggleDyslexicFont();
}

loadData()
renderStack()

// Read current card using TTS
// async function readCurrentCard(card) {
//   const text = card.querySelector(".section-text").innerText;
//   const response = await fetch("/tts", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       text,
//       voiceId: VOICE_ID
//     })
//   });

//   const audioBlob = await response.blob();
//   const audioUrl = URL.createObjectURL(audioBlob);
//   const audio = new Audio(audioUrl);

//   audio.onended = () => {
//     // When done, stack the card and show next
//     readStack.appendChild(card);
//     currentCardIndex++;
//     showCard(currentCardIndex);
//   };

//   audio.play();
// }

// Magnifier
const magnifierLens = document.getElementById("magnifierLens");

document.getElementById("magnifierToggle").addEventListener("change", (e) => {
    magnifier = e.target.checked;
    if (!magnifier) magnifierLens.style.display = "none";
});

document.addEventListener("mousemove", (e) => {
    if (!magnifier) return;

    const target = e.target;
    // Check if we are hovering over text inside the card
    if (target.classList.contains("section-text") || target.classList.contains("card-title")) {
        magnifierLens.style.display = "block";
        const zoomLevel = 2;

        // Position Lens
        magnifierLens.style.left = (e.pageX - 90) + "px"; 
        magnifierLens.style.top = (e.pageY - 90) + "px";

        // Copy text into lens
        magnifierLens.innerHTML = `<div class="zoomed-text">${target.innerText}</div>`;
        const zoomContent = magnifierLens.querySelector(".zoomed-text");

        // Align zoomed text
        const rect = target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        zoomContent.style.transform = `translate(${-offsetX * zoomLevel + 90}px, ${-offsetY * zoomLevel + 90}px) scale(${zoomLevel})`;
        
        // Match Font Styles
        const compStyle = window.getComputedStyle(target);
        zoomContent.style.font = compStyle.font;
        zoomContent.style.fontFamily = compStyle.fontFamily;
        zoomContent.style.lineHeight = compStyle.lineHeight;
    } else {
        magnifierLens.style.display = "none";
    }
});

// Dyslexic-Friendly Font
function toggleDyslexicFont() {
    if (dyslexicFont) {
        document.body.classList.add("dyslexic-mode");
    } else {
        document.body.classList.remove("dyslexic-mode");
    }
}

document.getElementById("dyslexicToggle").addEventListener("change", (e) => {
    dyslexicFont = e.target.checked;
    toggleDyslexicFont();
});

// 3. TEXT TO SPEECH TOGGLE
const speechToggle = document.getElementById("speechToggle");
const speechIcon = speechToggle.nextElementSibling;

speechToggle.addEventListener("change", (e) => {
    speechText = e.target.checked;
    
    if (speechText) {
        speakCard();
        speechIcon.classList.remove("icon-play");
        speechIcon.classList.add("icon-pause");
    } else {
        speechSynth.cancel(); 
        speechIcon.classList.remove("icon-pause");
        speechIcon.classList.add("icon-play");
    }
});

function speakCard() {
    speechSynth.cancel(); 

    const activeCardText = document.querySelector(".reading-card .section-text");
    const activeCardTitle = document.querySelector(".reading-card .card-title");

    if (activeCardText) {
      let fullText = (activeCardTitle ? activeCardTitle.innerText + ". " : "") + activeCardText.innerText;
      
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.rate = 0.9; 

      utterance.onend = () => {
          speechToggle.checked = false;
          speechIcon.classList.remove("icon-pause");
          speechIcon.classList.add("icon-play");
      };

      speechSynth.speak(utterance);
  }
}

// Initial Load
showCard(currentCardIndex);