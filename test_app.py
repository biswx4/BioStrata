import requests
import json
import random

url = "http://127.0.0.1:8000"

def test_health():
    print("\n--- Testing Health Endpoint ---")
    try:
        resp = requests.get(f"{url}/health")
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == "ok" and data.get("model_loaded") is True:
                print("PASS: Health check passed.")
                print(data)
            else:
                print("FAIL: Unexpected health response.")
                print(data)
        else:
             print(f"FAIL: Health check failed with status {resp.status_code}")
             print(resp.text)
    except Exception as e:
        print(f"FAIL: Request failed: {e}")

if __name__ == "__main__":
    test_health()
