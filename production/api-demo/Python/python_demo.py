import requests
import json
import hashlib
import hmac
import base64
from email.utils import formatdate

class KeyvoxApiClient:
    def __init__(self, api_key, secret_key, base_url="https://eco.blockchainlock.io"):
        if not api_key or not secret_key:
            raise ValueError("API key and secret key are required.")
        self.api_key = api_key
        self.secret_key = secret_key
        self.base_url = base_url
        self.host = "default.pms"

    def _generate_auth_headers(self, api_path, json_body):
        date_str = formatdate(timeval=None, localtime=False, usegmt=True)
        digest_hash = hashlib.sha256(json_body.encode('utf-8')).digest()
        digest = f"SHA-256={base64.b64encode(digest_hash).decode('utf-8')}"
        request_line = f"POST {api_path} HTTP/1.1"
        string_to_sign = f"date: {date_str}\n{request_line}\ndigest: {digest}"

        signature_hash = hmac.new(
            self.secret_key.encode('utf-8'),
            string_to_sign.encode('utf-8'),
            hashlib.sha256
        ).digest()
        signature = base64.b64encode(signature_hash).decode('utf-8')

        authorization = (
            f'hmac username="{self.api_key}", '
            'algorithm="hmac-sha256", '
            'headers="date request-line digest", '
            f'signature="{signature}"'
        )

        headers = {
            'date': date_str,
            'digest': digest,
            'authorization': authorization,
            'x-target-host': self.host,
            'Content-Type': 'application/json'
        }
        return headers

    def _post(self, api_name, params=None):
        api_path = f"/api/eagle-pms/v1/{api_name}"
        url = f"{self.base_url}{api_path}"
        
        body_dict = params if params is not None else {}
        
        json_body = json.dumps(body_dict, separators=(',', ':'))

        headers = self._generate_auth_headers(api_path, json_body)

        try:
            response = requests.post(url, headers=headers, data=json_body)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            if e.response is not None:
                print(f"Status Code: {e.response.status_code}")
                print(f"Response Body: {e.response.text}")
            return None

    # --- Public API Methods ---

    def get_units(self):
        return self._post("getUnits")

    def create_lock_pin(self, unit_id, pin_code, pin_type, s_time, e_time):
        params = {
            "unitId": unit_id,
            "pinCode": str(pin_code),
            "pinType": str(pin_type),
            "sTime": str(s_time),
            "eTime": str(e_time)
        }
        return self._post("createLockPin", params)

    def get_lock_status(self, lock_id):
        params = {"lockId": lock_id}
        return self._post("getLockStatus", params)
    
    def unlock(self, lock_id, flag):
        params = {
            "lockId": lock_id,
            "flag": flag
            }
        return self._post("unlock", params)

if __name__ == "__main__":
    API_KEY = "##################################"
    SECRET_KEY = "##################################"

    if "YOUR_API_KEY" in API_KEY or "YOUR_SECRET_KEY" in SECRET_KEY:
        print("Please replace 'YOUR_API_KEY' and 'YOUR_SECRET_KEY' with your actual credentials.")
    else:
        client = KeyvoxApiClient(api_key=API_KEY, secret_key=SECRET_KEY)

        units_response = client.get_units()
        if units_response:
            print(json.dumps(units_response, indent=2, ensure_ascii=False))

        lock_id_to_test = "DUMMY_LOCK_ID" 
        status_response = client.get_lock_status(lock_id=lock_id_to_test)
        if status_response:
            print(json.dumps(status_response, indent=2, ensure_ascii=False))
    
        lock_id_to_test = "DUMMY_LOCK_ID" 
        status_response = client.unlock(lock_id=lock_id_to_test, flag=1)
        if status_response:
            print(json.dumps(status_response, indent=2, ensure_ascii=False))