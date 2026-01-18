from flask import Flask, request, jsonify, render_template
import os
from dotenv import load_dotenv
import json
import re

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
    return render_template('home.html')

@app.route('/cards')
def test_cards():
    return render_template('cards.html')

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
    I have attached a PDF. Extract the content and restructure it.

    ### CRITICAL INSTRUCTION: STRICT SEGMENTATION
    1.  **MERGE** the source text into one continuous stream.
    2.  **SLICE** that stream into small, digestible cards.
    
    ### THE "GOLDILOCKS" RULE (Size Constraints)
    - **Target Length:** 3 sentences per card.
    - **Hard Maximum:** NEVER exceed 5 sentences per card.
    - **Long Topics:** If a section is too long, SPLIT it into multiple cards.
    
    ### REQUIRED JSON STRUCTURE
    Return a strict JSON Array of objects. Each object must have:
    - "title": A short, 3-5 word header.
    - "text": The original text (strictly 3-4 sentences).
    - "simple_text": A Grade 5 simplified version (shorter sentences).
    - "summary": A 1-sentence summary.

    Example Output:
    [
      {
        "title": "International Trends", 
        "text": "The study found a decline in reading attitudes. This was observed in 13 countries. Parents' attitudes dropped as well.", 
        "simple_text": "People are enjoying reading less. This is happening in many countries.", 
        "summary": "Reading enjoyment is dropping globally."
      }
    ]
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

        raw_text = response.text
        print(f"DEBUG AI RESPONSE: {raw_text[:200]}")

        match = re.search(r'\[.*\]', raw_text, re.DOTALL)

        if match:
            clean_json = match.group(0)
            data = json.loads(clean_json)
            return jsonify(data)
        else:
            return jsonify({"error": "AI not return valid"}), 500
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": f"Gemini Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)