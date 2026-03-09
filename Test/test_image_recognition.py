import base64
from openai import OpenAI
import os

# API Key - Using the one provided earlier/stored in .env
api_key = "sk-ai-v1-b0e974d58dabce1948f7f248ad12b3669f43edd10f6624fbf0cd55097a332d5f"
image_path = r"d:\Expiremental\FastAPI\uploads\documents\bded48ba-e336-4e41-b33f-b82a681f25e2.png"

def encode_image(path):
    with open(path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

client = OpenAI(
    base_url="https://zenmux.ai/api/v1",
    api_key=api_key,
)

print("--- Testing Image Recognition ---")
try:
    base64_image = encode_image(image_path)
    
    response = client.chat.completions.create(
        model="z-ai/glm-4.6v-flash-free",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "What's in this image?"},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{base64_image}"
                        },
                    },
                ],
            }
        ],
        max_tokens=300,
    )
    print("Image Recognition Result:")
    print(response.choices[0].message.content)
except Exception as e:
    print(f"Error during image recognition test: {e}")
