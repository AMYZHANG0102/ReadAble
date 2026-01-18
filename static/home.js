let selectedFile = null;

const fileInput = document.getElementById("fileInput");
const selectFileBtn = document.getElementById("selectFileBtn");
const fileNameDisplay = document.getElementById("fileName");

// Open file picker when button is clicked
selectFileBtn.addEventListener("click", () => {
  fileInput.click();
});

// File selection
fileInput.addEventListener("change", (event) => {
  selectedFile = event.target.files[0];

  if (selectedFile) {
    console.log("Selected file:", selectedFile);
    fileNameDisplay.innerText = `Selected: ${selectedFile.name}`;
  }
});
