# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/serpis.json"  # Adjust the path as needed

# Set the working directory in the container
WORKDIR /app

# Install system dependencies and TensorFlow
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        g++ \
        curl \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender-dev \
    && pip install --upgrade pip \
    && pip install tensorflow==2.13.0 \
    && pip install flasgger flask flask-jwt-extended werkzeug google-cloud-firestore python-dotenv yfinance

# Copy the current directory contents into the container at /app
COPY . /app/

# Install Python dependencies from requirements.txt (if available)
# COPY requirements.txt /app/
# RUN pip install -r requirements.txt

# Expose the port that Flask will run on
EXPOSE 5000

# Set the default command to run your app
CMD ["python", "app.py"]
