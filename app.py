from flask import Flask, request, jsonify, render_template
import os
from dotenv import load_dotenv

# Gemini AI
from google import genai
from google.genai import types

# Load environment variables from .env file
load_dotenv()
# Get key
api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']

    # Read file bytes directly
    file_bytes = file.read()

    # Prompt
    prompt = """
    You are an ADHD Reading Assistant.
    I have attached a PDF. Your job is to extract content and RESTRUCTURE it into "Dual-Mode Cards".

    ### RULES
    1. **GROUPING:** Group sentences into paragraphs of 3-5 sentences.
    2. **SIMPLIFICATION:** For *every* group, write a second version that is:
       - Grade 5 reading level.
       - Uses simple vocabulary (e.g., change "utilize" to "use").
    
    3. **OUTPUT FORMAT (Strict HTML):**
       - Use <h1> for the main title.
       - Wrap every content block in a <div class="reading-card">.
       - Inside the card, create TWO sections:
         1. <div class="original-text"> [The merged original text] </div>
         2. <div class="simple-text" style="display:none;"> [The simplified version] </div>
         3. <button class="simplify-btn" onclick="toggleText(this)">✨ Simplify</button>
       - Return ONLY raw HTML string (no markdown).

    4. **CLEANING:** Remove contact info, footers, and "Notes to Editors".
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Content(
                    parts=[
                        types.Part.from_text(text=prompt),
                        types.Part.from_bytes(data=file_bytes, mime_type='application/pdf')
                    ]
                )
            ]
        )
        return jsonify({"html": response.text})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": f"Gemini Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)