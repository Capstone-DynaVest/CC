# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV GOOGLE_APPLICATION_CREDENTIALS="/app/serpis.json"  

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
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

# Install virtualenv
RUN pip install virtualenv

# Create and activate a virtual environment
RUN python -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Install Python dependencies
RUN pip install \
    Flask==2.3.2 \
    flask-jwt-extended==4.4.4 \
    werkzeug==2.3.5 \
    google-cloud-firestore==2.7.0 \
    tensorflow==2.13.0 \
    flask-cors \
    python-dotenv==1.0.0 \
    yfinance==0.2.22 \
    flasgger==0.9.5

# Copy the application source code into the container
COPY . /app/

# Ensure the correct permissions for the application
RUN chmod +x /app/app.py

# Expose the port that Flask will run on
EXPOSE 8080

# Set the default command to run your app
CMD ["python", "app.py"]
