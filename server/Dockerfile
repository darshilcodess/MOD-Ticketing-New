FROM mcr.microsoft.com/playwright/python:v1.43.0-jammy

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# The base image already includes browsers and dependencies.
# We can optionally run this to ensure everything is synced:
# RUN playwright install chromium

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
