📚 **ReadAble: AI-Powered Accessible Reading**

ReadAble is a web-based reading assistant designed to support users with ADHD, Dyslexia, or general reading fatigue. It transforms long, complex PDF documents into a series of digestible, interactive cards using Gemini AI.

**✨ Key Features**
- AI-Powered Segmentation: Automatically slices long PDFs into 3-4 sentence "chunks" to prevent cognitive overwhelm.

- Interactive Card Stack: Features a modern "sticky" scroll animation where previous cards recede into the background, maintaining focus on the current content.

- Dynamic Simplification: Users can toggle between the Original text, a Simplified version (Grade 5 level), or a One-sentence Summary on any card.

- Dyslexia-Friendly Mode: One-click toggle for OpenDyslexic font and specialized letter spacing.

- Audio Support: Integrated Text-to-Speech (TTS) to provide a "gentle voice" reading experience.

- Magnifier Tool: A hover-based lens that enlarges text to reduce accidental clicks and improve focus.

**💻 Tech Stack**
- Frontend: HTML5, CSS3 (Scroll-Driven Animations, View Timelines), JavaScript (ES6).

- Backend: Flask (Python), PyPDF2/pdfplumber.

- AI Engine: Google Gemini 2.5 Flash (Optimized for speed and efficiency).
-----------------------------------------------------------------------------------
**🚀 Installation & Setup**

Clone the Repository:

- git clone https://github.com/yourusername/ReadAble.git
  
- cd ReadAble

Install Dependencies:
- pip install flask google-genai PyPDF2 pdfplumber python-dotenv

Configure Environment: Create a .env file in the root directory and add your Gemini API Key:
- Code Snippet: GEMINI_API_KEY=your_actual_key_here

Run the App:
- python app.py
- Visit http://localhost:5000 in your browser.
