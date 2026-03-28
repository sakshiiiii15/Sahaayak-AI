import requests

url = "http://127.0.0.1:5000/analyze"

data = {
    "text": "you won 2000000000 ruppees , withdraw it soon !"
}

response = requests.post(url, json=data)

print("Status Code:", response.status_code)
print("Response:", response.json())