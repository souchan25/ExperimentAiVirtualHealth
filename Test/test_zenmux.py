from openai import OpenAI
import os

# API Key provided by user
api_key = "sk-ai-v1-b0e974d58dabce1948f7f248ad12b3669f43edd10f6624fbf0cd55097a332d5f"

client = OpenAI(
  base_url="https://zenmux.ai/api/v1",
  api_key=api_key,
)

print("--- Testing Chat Completion ---")
try:
    # Chat Completion
    completion = client.chat.completions.create(
      model="xiaomi/mimo-v2-flash-free",
      messages=[
        {
          "role": "user",
          "content": "What is the meaning of life?"
        }
      ]
    )
    print("Chat Completion Result:")
    print(completion.choices[0].message.content)
except Exception as e:
    print(f"Chat Completion Error: {e}")

print("\n--- Testing Responses API ---")
try:
    # Responses API (Note: This might be a custom endpoint for ZenMux or a newer OpenAI-like feature)
    # The user's code used client.responses.create, which isn't standard in basic OpenAI client
    # but I will try to follow their request. If it fails, I'll report it.
    if hasattr(client, 'responses'):
        responses = client.responses.create(
          model="xiaomi/mimo-v2-flash-free",
          input="What is the meaning of life?"
        )
        print("Responses Result:")
        print(responses)
    else:
        print("Error: 'client.responses' is not available in the installed openai version.")
except Exception as e:
    print(f"Responses API Error: {e}")
