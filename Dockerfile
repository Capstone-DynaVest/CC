# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV GOOGLE_APPLICATION_CREDENTIALS="/serpis.json"  # Ensure the path aligns with the WORKDIR

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy the application source code into the container
COPY . /app/

# Ensure the correct permissions for the application
RUN chmod +x /app/app.py

# Expose the port that Flask will run on
EXPOSE 4000

# Set the default command to run your app
CMD ["python", "app.py"]
