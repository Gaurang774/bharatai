FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
# - build-essential: needed to compile some Python packages
# - libpq-dev: PostgreSQL client library for psycopg2
# - tesseract-ocr: OCR engine for scanned PDFs
# - tesseract-ocr-hin: Hindi language pack for Tesseract
# - poppler-utils: converts PDF pages to images for OCR (pdf2image)
# - curl: for health checks
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    tesseract-ocr \
    tesseract-ocr-hin \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create cache directories with proper permissions
RUN mkdir -p /app/chroma_data /app/model_cache /app/uploads

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
