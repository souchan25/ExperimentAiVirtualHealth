import asyncio
import os
import sys

sys.path.append(os.getcwd())

from app.config import settings
from openai import AsyncOpenAI
import json

async def test_extraction():
    vision_model = "pixtral-12b-2409"
    api_key = settings.MISTRAL_API_KEY
    base_url = "https://api.mistral.ai/v1"
    
    # Example cloudinary URL
    image_url = "https://res.cloudinary.com/dahbeeia9/image/upload/v1/health_assistant/documents/sample"
    
    print(f"Testing extraction with model: {vision_model}")
    print(f"Base URL: {base_url}")
    print(f"API Key present: {bool(api_key)}")
    
    try:
        client = AsyncOpenAI(api_key=api_key, base_url=base_url)
        response = await client.chat.completions.create(
            model=vision_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a clinical document parser. Return ONLY valid JSON and no other text. Extract JSON data from the medical image. Ensure these fields are explicitly present: patient_name, date, test_type, results (list of key-value), summary."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Extract clinical data from this medical document."},
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]
                }
            ]
        )
        content = response.choices[0].message.content
        print("RAW CONTENT:", content)
        
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
            content = content.split("```")[0].strip()
            
        extracted_data = json.loads(content)
        print("PARSED JSON:", extracted_data)
    except Exception as e:
        print(f"AI Extraction failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_extraction())
