
FROM python:3.10-slim


ENV PYTHONUNBUFFERED=1
ENV GOOGLE_APPLICATION_CREDENTIALS="/app/serpis.json"  


WORKDIR /app


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


COPY requirements.txt /app/


RUN pip install -r requirements.txt


COPY . /app/


RUN chmod +x /app/app.py


EXPOSE 4000


CMD ["python", "app.py"]
