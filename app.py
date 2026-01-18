from flask import Flask, request, jsonify
import PyPDF2
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
    
    try:
        raw_text = extract_text(file)
    except Exception as e:
        return jsonify({"error": f"Error reading PDF: {str(e)}"}), 500

    # Prompt
    prompt = f"""
    You are a strictly filtering and formatting AI. Your goal is to extract ONLY the educational body content from the text provided.

    STRICT EXCLUSION RULES (Delete these instantly):
    - NO contact information (emails, phone numbers, addresses).
    - NO publishing details, copyrights, ISBNs, or citations.
    - NO table of contents, indices, or prefaces.
    - NO headers, footers, or page numbers.

    FORMATTING RULES:
    1. Output ONLY valid HTML.
    2. Split long sections into smaller, readable chunks of approximately 4 sentences.
    3. Wrap each chunk in a <div class="reading-card">.
    4. Inside the card, use <h3> for subheadings and <p> for the 4-sentence chunks.
    5. Do not change the wording of the body text, only split it.

    Input Text:
    {raw_text} 
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        return jsonify({"html": response.text})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": f"Gemini Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)