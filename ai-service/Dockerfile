# AI Service Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
	gcc \
	g++ \
	libgl1-mesa-glx \
	libglib2.0-0 \
	libsm6 \
	libxext6 \
	libxrender-dev \
	libgomp1 \
	&& rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create non-root user
RUN addgroup --gid 1001 --system python && \
	adduser --no-create-home --shell /bin/false --disabled-password --uid 1001 --system --group python

USER python

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
