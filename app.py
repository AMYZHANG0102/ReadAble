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
    #    You are an ADHD Reading Assistant.
    # I have attached a PDF. Extract the content and restructure it.

    # ### CRITICAL INSTRUCTION: STRICT SEGMENTATION
    # 1.  **MERGE** the source text into one continuous stream.
    # 2.  **SLICE** that stream into small, digestible cards.
    
    # ### THE "GOLDILOCKS" RULE (Size Constraints)
    # - **Target Length:** 3 sentences per card.
    # - **Hard Maximum:** NEVER exceed 5 sentences per card.
    # - **Long Topics:** If a section is too long, SPLIT it into multiple cards.
    
    # ### REQUIRED JSON STRUCTURE
    # Return a strict JSON Array of objects. Each object must have:
    # - "title": A short, 3-5 word header.
    # - "text": The original text (strictly 3-4 sentences).
    # - "simple_text": A Grade 5 simplified version (shorter sentences).
    # - "summary": A 1-sentence summary.

    # Example Output:
    # [
    #   {
    #     "title": "International Trends", 
    #     "text": "The study found a decline in reading attitudes. This was observed in 13 countries. Parents' attitudes dropped as well.", 
    #     "simple_text": "People are enjoying reading less. This is happening in many countries.", 
    #     "summary": "Reading enjoyment is dropping globally."
    #   }
    # ]
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
    time.sleep(25) 

    mock_data = [
        {
            "title": "IEA's Literacy Day Reflection",
            "text": "This International Literacy Day, IEA (The International Association for the Evaluation of Educational Achievement) reflects on data from PIRLS (Progress in International Reading Literacy Study), in the context of the pandemic. The study investigates declining trends in reading attitudes. It asks if students were prepared for literacy at home during the pandemic.",
            "simple_text": "On International Literacy Day, the IEA looked at data from a study called PIRLS. They wanted to see if kids were ready to read at home during the pandemic. This study checks how much kids like reading.",
            "summary": "IEA reviewed PIRLS data to see how reading attitudes changed and if students were ready for home literacy during the pandemic."
        },
        {
            "title": "Global Reading Decline",
            "text": "Recent PIRLS analysis, titled 'Troubling trends: An international decline in attitudes toward reading,' found a general drop in reading attitudes. This decline affects both grade four students and their parents. It has been observed over 15 years, starting from 2001.",
            "simple_text": "A new study found that people are liking reading less. This includes fourth-grade students and their parents. This trend has been happening for over 15 years, since 2001.",
            "summary": "PIRLS data shows a 15-year decline in reading attitudes among fourth-grade students and their parents globally."
        },
        {
            "title": "Widespread Attitude Drop",
            "text": "Students' attitudes to reading decreased in 13 out of 18 participating countries across all study cycles. Parents' reading attitudes also fell in 14 out of 16 participating countries. These trends raise concerns about home reading during the pandemic.",
            "simple_text": "Kids' enjoyment of reading went down in many countries. Parents' enjoyment of reading also went down in most countries. This makes people worry about reading at home, especially during the pandemic.",
            "summary": "Student reading attitudes declined in 13 countries and parent attitudes in 14 countries, raising concerns about home literacy."
        },
        {
            "title": "Digital Access Challenges in 2016",
            "text": "In the 2016 PIRLS study, 36% of parents reported no available device for their child to read eBooks. Additionally, 62% of school principals said their school did not provide access to digital books. These figures highlight prior difficulties in supporting home literacy.",
            "simple_text": "Before the pandemic, many families lacked digital reading tools. In 2016, over one-third of parents had no device for eBooks. Most schools also did not provide digital books then.",
            "summary": "Pre-pandemic data showed significant gaps in access to digital reading resources for students."
        }
    ]

    return jsonify(mock_data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)