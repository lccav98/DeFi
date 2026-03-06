FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml /app/
COPY app /app/app
COPY README.md /app/
RUN pip install --no-cache-dir -e .
CMD ["uvicorn", "app.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
