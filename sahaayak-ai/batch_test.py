import requests
import json

url = "http://127.0.0.1:5000/analyze"

scam_samples = [
    {
        "type": "Electricity Bill Scam",
        "text": "Your Electricity power will be disconnected Tonight at 9.30 PM from Electricity office. because your last month bill was not update. Please immediately contact with our electricity officer 82404XXXXX. Thank you."
    },
    {
        "type": "KYC/Bank Scam",
        "text": "Dear Customer, your HDFC Bank account will be blocked today. Please click here https://bit.ly/hdfc-kyc-update to update your PAN Card details immediately."
    },
    {
        "type": "Part-time Job Scam",
        "text": "Earn Rs.2000-5000 daily by working from home. Join our part-time job now. No experience needed. Contact on WhatsApp: https://wa.me/91XXXXXXXXXX"
    },
    {
        "type": "Lottery/Reward Scam",
        "text": "Congratulations! You have been selected as the winner of a Rs. 25,00,000 lottery from KBC. Call Mr. Rana Pratap Singh at 098XXXXXXX to claim your cash prize."
    },
    {
        "type": "Parcel/Customs Scam",
        "text": "Your parcel from FedEx has been seized by Delhi Customs due to illegal items. Please pay Rs. 15,000 for customs clearance to release the package. Transaction link: https://pay-customs.in"
    }
]

print(f"{'TYPE':<25} | {'STATUS':<10} | {'SCORE':<5} | {'WHY (FIRST 2)'}")
print("-" * 80)

for sample in scam_samples:
    try:
        response = requests.post(url, json={"text": sample["text"]})
        result = response.json()
        status = result.get("status", "N/A")
        score = result.get("scam_score", 0)
        why = ", ".join(result.get("why", [])[:2])
        print(f"{sample['type']:<25} | {status:<10} | {score:<5} | {why}")
    except Exception as e:
        print(f"{sample['type']:<25} | ERROR: {e}")

print("\nBatch test complete.")
