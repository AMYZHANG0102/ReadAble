const fileInput = document.getElementById('pdfUpload');

if (fileInput) {
  fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileNameEl = document.getElementById("fileName");
        if (fileNameEl) {
          fileNameEl.textContent = `Selected file: ${file.name}`;
        }

        console.log("File selected:", file.name); // Debugging check

        // Show loading state
        const currentCard = document.getElementById("current-card");
        if(currentCard) currentCard.innerHTML = `<div class="reading-card"><p>✨ AI is reading your file...</p></div>`;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // Save data
            localStorage.setItem("sections", JSON.stringify(data));

            // Redirect to cards page
            window.location.href = "/cards";


        } catch (err) {
            console.error(err);
            alert("Upload failed: " + err.message);
        }
    });
  } else {
    console.error("Critical Error: Could not find element with ID 'pdfUpload' in HTML");
  }