import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the current directory to sys.path to allow importing from 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.llm import ai_generator, extract_clinical_data

async def test_provider(provider_name: str):
    print(f"\n--- Testing Provider: {provider_name} ---")
    try:
        response = await ai_generator.generate_chat_response(
            message="Hello, can you confirm you are working? Please reply with a short sentence identifying yourself.",
            target=provider_name
        )
        print(f"Response: {response}")
        return True
    except Exception as e:
        print(f"Error testing {provider_name}: {e}")
        return False

async def test_extraction():
    print("\n--- Testing Clinical Data Extraction ---")
    history = [
        {"role": "user", "content": "Hi, I've had a sharp headache in my temples for 3 days. It's really bad, maybe an 8 out of 10."},
        {"role": "assistant", "content": "I'm sorry to hear that. Is the pain constant or does it come and go?"},
        {"role": "user", "content": "It's constant and I also feel a bit nauseous."}
    ]
    try:
        data = await extract_clinical_data(history)
        print(f"Extracted Data: {data}")
        # Expected: symptoms including 'headache', 'temples', 'nauseous'; duration_days: 3; severity: 3 (high)
        return True
    except Exception as e:
        print(f"Error in extraction: {e}")
        return False

async def test_refinement():
    print("\n--- Testing Diagnosis Refinement ---")
    symptoms = ["sharp headache", "temples", "nausea"]
    ml_disease = "Migraine"
    ml_conf = 0.85
    try:
        refined = await ai_generator.refine_diagnosis(symptoms, ml_disease, ml_conf)
        print(f"Refined Diagnosis: {refined}")
        return True
    except Exception as e:
        print(f"Error in refinement: {e}")
        return False

async def main():
    load_dotenv()
    
    providers = ["groq", "mistral", "gemini", "openrouter", "github", "zenmux", "auto"]
    results = {}
    
    print("Starting LLM Verification...")
    
    for p in providers:
        results[p] = await test_provider(p)
    
    results["extraction"] = await test_extraction()
    results["refinement"] = await test_refinement()
    
    print("\n" + "="*30)
    print("VERIFICATION SUMMARY")
    print("="*30)
    for key, success in results.items():
        status = "SUCCESS" if success else "FAILED"
        print(f"{key.upper():<15}: {status}")
    print("="*30)

if __name__ == "__main__":
    asyncio.run(main())
