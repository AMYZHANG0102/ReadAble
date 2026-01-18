// VARIABLES:
const currentCard = document.getElementById("current-card");
const readStack = document.getElementById("read-stack");
const uploadBtn = document.querySelector('.upload-btn');
let speechText = false;
let magnifier = false;
let dyslexicFont = false;
const VOICE_ID = "ljX1ZrXuDIIRVcmiVSyR"
let currentCardIndex = 0;

// Default data (placeholder until upload)
let sections = [
  { text: "Upload a PDF to start!", simple_text: "Click the upload button.", explanation: "The app is waiting for your file." }
];

// 1. NEW: Upload Logic
const fileInput = document.getElementById('pdfUpload');

if (fileInput) {
  fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log("File selected:", file.name); // Debugging check

        // Show loading state
        const currentCard = document.getElementById("current-card");
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
        }
    });
  } else {
    console.error("Critical Error: Could not find element with ID 'pdfUpload' in HTML");
  }

// 2. UPDATED: Create Card (Now handles Simpler Text!)
function createCard(section) {
  const sectionCard = document.createElement("div");
  sectionCard.className = "reading-card";

  // 1. CONTAINER
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "card-content";

  // 2. TITLE (Always stays the same)
  const titleEl = document.createElement("h3");
  titleEl.className = "card-title";
  titleEl.innerText = section.title || "Section";

  // 3. BODY TEXT (Changes based on selection)
  const textEl = document.createElement("p");
  textEl.className = "section-text";
  textEl.innerText = section.text; // Default to Original

  // Assemble Text
  contentWrapper.appendChild(titleEl);
  contentWrapper.appendChild(textEl);

  // 4. THE POPUP MENU with 3 Options
  const helpBtn = document.createElement("span");
  helpBtn.className = "help-btn";
  helpBtn.innerText = "?";

  const popup = document.createElement("div");
  popup.className = "options-popup";

  // --- BUTTON 1: ORIGINAL ---
  const originalBtn = document.createElement("div");
  originalBtn.className = "option-pill active"; // Active by default
  originalBtn.innerText = "📄 Original";

  // --- BUTTON 2: SIMPLIFIED ---
  const simpleBtn = document.createElement("div");
  simpleBtn.className = "option-pill";
  simpleBtn.innerText = "✨ Simplified";

  // --- BUTTON 3: SUMMARY ---
  const summaryBtn = document.createElement("div");
  summaryBtn.className = "option-pill";
  summaryBtn.innerText = "📝 Summary";

  // --- CLICK HANDLERS ---
  
  // A helper to reset all buttons
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

  // Assemble Popup
  popup.appendChild(originalBtn);
  popup.appendChild(simpleBtn);
  popup.appendChild(summaryBtn);

  // Toggle Popup
  helpBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      popup.classList.toggle("show");
  });

  // Close when clicking card
  sectionCard.addEventListener("click", () => {
      popup.classList.remove("show");
  });

  // Final Assembly
  sectionCard.appendChild(helpBtn);
  sectionCard.appendChild(popup);
  sectionCard.appendChild(contentWrapper);

  return sectionCard;
}

// HELPER: Show Card
function showCard(index) {
  currentCard.innerHTML = "";
  if (index >= sections.length) {
      currentCard.innerHTML = "<div class='reading-card'><h3>You finished the file! 🎉</h3></div>";
      return;
  }

  const card = createCard(sections[index]);
  currentCard.appendChild(card);
  
  // If Dyslexic Mode is ON, switch to simple text immediately
  if (dyslexicFont) toggleSimpleMode(card, true);
  
  // Auto-read if enabled
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
// 1. MAGNIFIER TOGGLE
document.getElementById("magnifierToggle").addEventListener("change", (e) => {
    magnifier = e.target.checked;
    const lens = document.getElementById("magnifierLens");
    
    if (!magnifier) {
        lens.style.display = "none";
    }
});

// MAGNIFIER LOGIC (Mouse Movement)
document.addEventListener("mousemove", (e) => {
    if (!magnifier) return;
    
    const lens = document.getElementById("magnifierLens");
    const target = e.target;
    
    // Only magnify if hovering over text
    if (target.classList.contains("section-text") || target.classList.contains("card-title")) {
        lens.style.display = "block";
        
        // Position Lens
        const zoomLevel = 2; // How much larger?
        lens.style.left = e.pageX - 75 + "px"; // Center the 150px lens
        lens.style.top = e.pageY - 75 + "px";
        
        // Copy text into lens
        lens.innerHTML = `<div class="zoomed-text">${target.innerText}</div>`;
        
        // Adjust zoomed text position inside lens to match cursor
        const rect = target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        
        const zoomText = lens.querySelector(".zoomed-text");
        zoomText.style.transform = `translate(${-offsetX * zoomLevel + 75}px, ${-offsetY * zoomLevel + 75}px) scale(${zoomLevel})`;
        // Note: You need simple CSS for .zoomed-text in your stylesheet
    } else {
        lens.style.display = "none";
    }
});


// 2. DYSLEXIC FONT TOGGLE
document.getElementById("dyslexicToggle").addEventListener("change", (e) => {
    dyslexicFont = e.target.checked;
    
    // Toggle class on the body (simplest way)
    if (dyslexicFont) {
        document.body.classList.add("dyslexic-mode");
    } else {
        document.body.classList.remove("dyslexic-mode");
    }
    
    // Optional: Also auto-switch to "Simplified" text if you want?
});


// 3. TEXT TO SPEECH TOGGLE
document.getElementById("speechToggle").addEventListener("change", (e) => {
    speechText = e.target.checked;
    
    if (speechText) {
        // Read the currently visible card
        readCurrentCard();
    } else {
        // Stop reading
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
});

// TTS FUNCTION (Using Browser's Built-in Voice for zero-latency)
function readCurrentCard() {
    if (!speechText) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel(); // Stop previous

    // Get the text from the CURRENT active card
    const activeCard = document.querySelector(".reading-card:last-child"); 
    // Note: Since cards stack, the last one in DOM is usually the top one visually? 
    // Wait, your stack logic might mean the 'currentCard' container holds the active one.
    
    const container = document.getElementById("current-card");
    if (!container || !container.innerText) return;

    const textToRead = container.innerText.replace("?", "").replace("📄 Original", "").replace("✨ Simplified", "").replace("📝 Summary", ""); // Clean up UI text

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.9; // Slightly slower is better for accessibility
    window.speechSynthesis.speak(utterance);
}

// LOAD FIRST CARD:
showCard(currentCardIndex);