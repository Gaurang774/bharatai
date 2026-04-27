from main import app

print("Registered Routes:")
for route in app.routes:
    if hasattr(route, "path"):
        print(f"Path: {route.path}, Name: {route.name}, Methods: {getattr(route, 'methods', 'N/A')}")
