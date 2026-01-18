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

def clean_text(raw_text):
    """
    Takes the messy PDF output and 'heals' broken sentences.
    1. Replaces single newlines within a sentence with a space.
    2. Removes multiple spaces.
    3. Keeps double newlines (real paragraphs) if possible, 
       but for this specific problem, flattening it mostly works best.
    """
    # Step 1: Replace multiple newlines with a unique marker (so we don't lose real paragraphs yet)
    # (Assuming double newline means a real paragraph in the source)
    text = re.sub(r'\n\s*\n', '||PARAGRAPH_BREAK||', raw_text)
    
    # Step 2: Replace single newlines with a space (This fixes the "broken sentence" issue)
    text = text.replace('\n', ' ')
    
    # Step 3: Replace the marker back to a newline (optional) or just let the AI figure it out.
    # For your "grouping" goal, sending it as one big block often works BETTER.
    text = text.replace('||PARAGRAPH_BREAK||', '\n\n')
    
    # Step 4: Remove excessive spaces
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def extract_text(file):
    # Simple pdf extractor
    pdf_reader = PyPDF2.PdfReader(file)
    text = ""

    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']

    # Read file bytes directly
    file_bytes = file.read()
    
    # try:
    #     raw_text = extract_text(file)
    # except Exception as e:
    #     return jsonify({"error": f"Error reading PDF: {str(e)}"}), 500

    # cleaned_text = clean_text(raw_text)

    # Prompt
    prompt = f"""
    You are an ADHD Reading Assistant. 
    I have attached a PDF document. Your job is to extract the content and RESTRUCTURE it into easy-to-read "cards".

    ### RULES
    1. **GROUPING:** Create cards that contain **3 to 5 sentences** each. 
       - NEVER output a card with only 1 sentence.
       - If you see a short sentence, merge it with the next one.
    
    2. **CLEANING:** - Remove contact info, "Notes to Editors", addresses, and list of countries.
       - Remove "EMBARGO" or "ENDS".
    
    3. **OUTPUT FORMAT:**
       - Use <h1> for the main title.
       - Use <div class="reading-card"><p> [Content] </p></div> for the blocks.
       - Return ONLY raw HTML string (no markdown blocks).
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