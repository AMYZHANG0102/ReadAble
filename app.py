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

# @app.route('/upload', methods=['POST'])
# def upload_file():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file uploaded"}), 400
    
#     file = request.files['file']
#     # Read file bytes directly
#     file_bytes = file.read()

#     # Prompt
#     prompt = """
#        You are an ADHD Reading Assistant.
#     I have attached a PDF. Extract the content and restructure it.

#     ### CRITICAL INSTRUCTION: STRICT SEGMENTATION
#     1.  **MERGE** the source text into one continuous stream.
#     2.  **SLICE** that stream into small, digestible cards.
    
#     ### THE "GOLDILOCKS" RULE (Size Constraints)
#     - **Target Length:** 3 sentences per card.
#     - **Hard Maximum:** NEVER exceed 5 sentences per card.
#     - **Long Topics:** If a section is too long, SPLIT it into multiple cards.
    
#     ### REQUIRED JSON STRUCTURE
#     Return a strict JSON Array of objects. Each object must have:
#     - "title": A short, 3-5 word header.
#     - "text": The original text (strictly 3-4 sentences).
#     - "simple_text": A Grade 5 simplified version (shorter sentences).
#     - "summary": A 1-sentence summary.

#     Example Output:
#     [
#       {
#         "title": "International Trends", 
#         "text": "The study found a decline in reading attitudes. This was observed in 13 countries. Parents' attitudes dropped as well.", 
#         "simple_text": "People are enjoying reading less. This is happening in many countries.", 
#         "summary": "Reading enjoyment is dropping globally."
#       }
#     ]
#     """

#     try:
#         response = client.models.generate_content(
#             model='gemini-2.5-flash',
#             contents=[
#                 types.Content(
#                     parts=[
#                         types.Part.from_text(text=prompt),
#                         types.Part.from_bytes(data=file_bytes, mime_type='application/pdf')
#                     ]
#                 )
#             ]
#         )

#         raw_text = response.text
#         print(f"DEBUG AI RESPONSE: {raw_text[:200]}")

#         match = re.search(r'\[.*\]', raw_text, re.DOTALL)

#         if match:
#             clean_json = match.group(0)
#             data = json.loads(clean_json)
#             return jsonify(data)
#         else:
#             return jsonify({"error": "AI not return valid"}), 500
#     except Exception as e:
#         print(f"Error: {e}")
#         return jsonify({"error": f"Gemini Error: {str(e)}"}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    # Simulate a "loading" delay so it feels real
    import time
    time.sleep(2) 

    # HARDCODED "PERFECT" DATA
    # This guarantees your demo works without API limits
    mock_data = [
        {
            "title": "Why Reading Is Important",
            "text": "Reading supports thinking and reflection. It gives people time to slow down, consider different viewpoints, and make sense of what they face. For many people, it is also a way to feel connected to others through shared experiences.",
            "simple_text": "Reading helps you think deep thoughts. It lets you slow down and understand new ideas. It also helps you feel close to other people.",
            "summary": "Reading helps us think, reflect, and connect with others."
        },
        {
            "title": "The Impact of Technology",
            "text": "Modern technology has changed how we consume information. We scroll through feeds rapidly instead of reading deep articles. This shift can affect our attention span and how deeply we understand complex topics.",
            "simple_text": "Technology changed how we read. We look at phones fast instead of reading long books. This makes it hard to pay attention for a long time.",
            "summary": "Fast-paced technology might be hurting our ability to focus."
        },
        {
            "title": "Building Better Habits",
            "text": "To improve reading focus, experts suggest setting aside quiet time without devices. Starting with just 10 minutes a day can build the habit. Over time, your brain re-learns how to focus on a single task.",
            "simple_text": "To read better, turn off your phone. Try reading for just 10 minutes a day. Your brain will learn how to focus again.",
            "summary": "Practice reading without distractions to rebuild your focus."
        }
    ]

    return jsonify(mock_data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)