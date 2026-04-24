import requests
import json
import base64

def test_sarvam_preview():
    url = "http://localhost:8001/voices/preview"
    payload = {
        "provider": "sarvam",
        "voice_id": "shreya",
        "model": "bulbul:v3",
        "language": "hi-IN",
        "text": "Namaste! Main aapki receptionist Shreya hoon. Aap kaise hain?"
    }
    
    try:
        print(f"Testing Sarvam preview at {url}...")
        response = requests.post(url, json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if "audio_base64" in data:
                audio_len = len(data["audio_base64"])
                print(f"SUCCESS: Received audio data ({audio_len} chars)")
                # save first 100 chars to verify
                print(f"Preview: {data['audio_base64'][:100]}...")
            else:
                print(f"FAILED: No audio_base64 in response: {data}")
        else:
            print(f"FAILED: {response.text}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_sarvam_preview()
