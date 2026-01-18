// VARIABLES:
const currentCard = document.getElementById("current-card");
const readStack = document.getElementById("read-stack");
const uploadBtn = document.querySelector('.upload-btn');
const fileInput = document.getElementById('pdfUpload');

let speechText = false;
let magnifier = false;
let dyslexicFont = false;
let speechSynth = window.speechSynthesis; // Browser's built-in speech
let currentCardIndex = 0;
const VOICE_ID = "ljX1ZrXuDIIRVcmiVSyR"

// Default data (placeholder until upload)
let sections = [
  { text: "Upload a PDF to start!", simple_text: "Click the upload button.", explanation: "The app is waiting for your file." }
];

// 1. UPLOAD LOGIC
if (fileInput) {
  fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show loading state
        if(currentCard) currentCard.innerHTML = `<div class="reading-card"><p>✨ AI is reading your file...</p></div>`;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // SUCCESS: Update global sections variable
            // Make sure 'sections' is defined globally at the top of your file!
            sections = data; 
            
            // Reset and show first card
            currentCardIndex = 0;
            const readStack = document.getElementById("read-stack");
            if(readStack) readStack.innerHTML = "";
            showCard(0);

        } catch (err) {
            console.error(err);
            alert("Upload failed: " + err.message);
            showCard(0); // Restore default
        }
  });
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

  contentWrapper.appendChild(titleEl);
  contentWrapper.appendChild(textEl);

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

// Show Card
function showCard(index) {
  currentCard.innerHTML = "";
  if (index >= sections.length) {
      currentCard.innerHTML = "<div class='reading-card'><h3>You finished the file! 🎉</h3></div>";
      return;
  }

  const card = createCard(sections[index]);
  currentCard.appendChild(card);
  
  if (dyslexicFont) toggleDyslexicFont(); // Apply font if already on
  if (speechText) speakCard(); // Auto-read if on
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