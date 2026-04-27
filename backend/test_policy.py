import httpx
import time
import sys

# Wait a bit just in case server is restarting
time.sleep(2)

def test_policy_engine():
    # Attempt to hit the rule API
    try:
        response = httpx.get("http://localhost:8000/api/policy/rules?active_only=true")
        print("Status Code for /rules:", response.status_code)
        print("Rules Total:", response.json().get("total"))
    except Exception as e:
        print("Error hitting /rules:", e)
        sys.exit(1)

    # Attempt to hit the test rule API
    test_queries = [
        "What is the GDP projection?", # ALLOW
        "What are the troop movements and classified details?", # BLOCK
        "Here is my PAN ABCDE1234F", # REDACT
        "tax evasion rules" # FLAG
    ]

    for q in test_queries:
        print(f"\n--- Testing Query: '{q}' ---")
        try:
            # We need admin access to use the test endpoint. But there's no auth token here...
            # Actually, Depends(admin_only) gets current user via get_current_user.
            # Without auth headers, it will throw 401. Let's just login first.
            
            # Login as admin
            login_data = {
                "email": "admin@nic.gov.in",
                "password": "admin123"
            }
            login_res = httpx.post("http://localhost:8000/api/auth/login", json=login_data)
            token = login_res.json().get("access_token")
            headers = {"Authorization": f"Bearer {token}"}
            
            res = httpx.post(
                f"http://localhost:8000/api/policy/rules/test?query={q}&ministry=General",
                headers=headers
            )
            print("Status Code:", res.status_code)
            print("JSON Action:", res.json().get("action"))
            print("JSON Risk:", res.json().get("risk_level"))
            print("JSON Redacted:", res.json().get("redacted_query"))
        except Exception as e:
            print("Error:", e)

if __name__ == "__main__":
    test_policy_engine()
