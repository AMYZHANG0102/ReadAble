const fileInput = document.getElementById('pdfUpload');
const stateEmpty = document.getElementById('state-empty');
const stateSelected = document.getElementById('state-selected');
const selectedFileName = document.getElementById('selectedFileName');
const convertBtn = document.getElementById('convertBtn');
const loadingText = document.getElementById('loadingText');

let selectedFile = null;

if (fileInput) {
    // 1. LISTEN FOR FILE SELECTION
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        selectedFile = file;

        // UI: Switch to "Selected" state
        stateEmpty.style.display = 'none';
        stateSelected.style.display = 'flex';
        selectedFileName.textContent = file.name;
    });

    // 2. LISTEN FOR CONVERT CLICK
    convertBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        // UI: Show loading
        convertBtn.style.display = 'none';
        loadingText.style.display = 'block';
        loadingText.innerHTML = "✨ Gemini is simplifying your reading...";

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // Send to Python
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // Save data & Redirect
            localStorage.setItem("readingData", JSON.stringify(data));
            window.location.href = "/cards";

        } catch (err) {
            console.error(err);
            alert("Upload failed: " + err.message);
            // Reset UI on error
            convertBtn.style.display = 'block';
            loadingText.style.display = 'none';
        }
    });
}