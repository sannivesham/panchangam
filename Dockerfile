# Multi-stage Dockerfile: Builds React frontend and runs FastAPI backend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app

# Install system dependencies including Swiss Ephemeris C-libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    libswe-dev \
    libswe0 \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend application and ephemeris files
COPY backend ./backend

# Copy built frontend assets from frontend-builder stage into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV PYTHONPATH="/app/backend"
ENV DISABLE_SQLALCHEMY_CEXT="1"
ENV PORT=8000

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
