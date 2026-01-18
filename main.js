// Variables
var magnifier = true;
var dyslexicFont = false;
var speechText = true;
const VOICE_ID = "ljX1ZrXuDIIRVcmiVSyR";

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

// Text-to-speech function
async function speakText(text) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVEN_LABS_API_KEY
    },
    body: JSON.stringify({
      text: text,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    })
  });

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);

  const audio = new Audio(audioUrl);
  audio.play();
}
// Read aloud on click
if (speechText) {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("section-text")) {
      speakText(e.target.innerText);
    }
  });
}
