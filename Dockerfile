FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY FastAPI/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy FastAPI app
COPY FastAPI/ ./FastAPI/

# Copy ML models and datasets
COPY ML/ ./ML/

# Copy assets (logo for PDF generation)
COPY FastAPI/assets/ ./FastAPI/assets/

WORKDIR /app/FastAPI

EXPOSE $PORT

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
