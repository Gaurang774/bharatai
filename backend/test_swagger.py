import httpx

def test_swagger_login():
    # Simulate Swagger UI sending form data
    form_data = {
        "username": "admin@nic.gov.in",
        "password": "admin123",
        "grant_type": "password"
    }
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        response = httpx.post("http://127.0.0.1:8000/api/auth/token", data=form_data, headers=headers)
        print("Status:", response.status_code)
        if response.status_code == 200:
            print("Token received successfully:", response.json().get("access_token")[:20] + "...")
        else:
            print("Error:", response.json())
    except Exception as e:
        print("Exception:", e)

if __name__ == "__main__":
    test_swagger_login()
