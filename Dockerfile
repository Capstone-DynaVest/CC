# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV GOOGLE_APPLICATION_CREDENTIALS="/app/serpis.json"  # Ensure the path aligns with the WORKDIR

# Set the working directory in the container
WORKDIR /app

# Install system dependencies and Python dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        g++ \
        curl \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender-dev \
    && pip install --upgrade pip

# Install Python libraries (using a multi-line approach for readability)
RUN pip install tensorflow==2.13.0 \
    flasgger \
    flask \
    flask-jwt-extended \
    werkzeug \
    google-cloud-firestore \
    python-dotenv \
    yfinance

# Copy the application source code into the container
COPY . /app/

# Ensure the correct permissions for the application
RUN chmod +x /app/app.py

# Expose the port that Flask will run on
EXPOSE 5000

# Set the default command to run your app
CMD ["python", "app.py"]
