import requests
import json

def verify_api():
    url = "http://localhost:8000/internships/"
    try:
        print(f"Fetching from {url}...")
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print(f"Successfully fetched {len(data)} internships.")
            print(json.dumps(data, indent=2))
        else:
            print(f"Failed to fetch data. Status code: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error connecting to API: {e}")

if __name__ == "__main__":
    verify_api()
