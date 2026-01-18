import requests

# The URL of your local server
url = 'http://127.0.0.1:5000/upload'

# Open the file you want to test
# Make sure 'test.pdf' exists in this folder!
files = {'file': open('testing_material.pdf', 'rb')}

try:
    print("Sending request to backend...")
    response = requests.post(url, files=files)
    
    # Print the status (200 means OK)
    print(f"Status Code: {response.status_code}")
    
    # Print the HTML response from Gemini
    if response.status_code == 200:
        print("\n--- GEMINI RESPONSE ---")
        print(response.json()['html'])
        print("-----------------------")
    else:
        print("Error:", response.text)
        
except Exception as e:
    print(f"Failed to connect: {e}")