# Use Python as base image
FROM python:3.9

# Set the working directory
WORKDIR /app

# Copy project files into the container
COPY . /app

# Install dependencies
RUN pip install flask flask-cors mysql-connector-python python-dotenv  # ✅ Includes flask-cors & python-dotenv

# Expose port 5000
EXPOSE 5000

# Run the Flask app
CMD ["python", "app.py"]
