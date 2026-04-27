# BharatAI Run Instructions

### 1. Run Backend (FastAPI)
```bash
cd /home/gaurang/Bharatai/bharatai/backend
# Create virtual environment (first time only)
python3 -m venv venv
# Activate virtual environment
source venv/bin/activate
# Install dependencies
pip install -r requirements.txt
# Run the backend server
uvicorn main:app --reload
```
*Backend runs at: http://localhost:8000*

### 2. Run Frontend (Next.js)
```bash
cd /home/gaurang/Bharatai/bharatai/frontend
# Install dependencies
npm install
# Run the development server
npm run dev
```
*Frontend runs at: http://localhost:3000*