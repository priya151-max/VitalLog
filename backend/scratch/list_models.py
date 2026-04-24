import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

try:
    models = client.models.list()
    print("Available Models:")
    for model in models.data[:10]: # Print first 10
        print(f"- {model.id}")
except Exception as e:
    print(f"Error: {e}")
