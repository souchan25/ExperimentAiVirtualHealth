"""
Disease Prediction Script
Interactive tool to predict diseases based on symptoms
"""

import pandas as pd
import pickle
import numpy as np
import os

# Get the ML folder path
ML_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_model(model_path=None):
    """Load the trained model"""
    if model_path is None:
        model_path = os.path.join(ML_DIR, 'models', 'disease_predictor.pkl')
    
    # Try v2 model first, then fall back to v1
    try:
        v2_path = os.path.join(ML_DIR, 'models', 'disease_predictor_v2.pkl')
        with open(v2_path, 'rb') as f:
            model_data = pickle.load(f)
        print("(Using enhanced model v2)")
    except FileNotFoundError:
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        print("(Using model v1)")
    
    return model_data['model'], model_data['feature_names']

def load_symptom_info():
    """Load symptom severity and disease descriptions"""
    try:
        severity_path = os.path.join(ML_DIR, 'Datasets', 'active', 'Symptom-severity.csv')
        severity_df = pd.read_csv(severity_path)
        severity_dict = dict(zip(severity_df['Symptom'], severity_df['weight']))
    except:
        severity_dict = {}
    
    try:
        desc_path = os.path.join(ML_DIR, 'Datasets', 'active', 'symptom_Description.csv')
        desc_df = pd.read_csv(desc_path)
        desc_dict = dict(zip(desc_df['Disease'], desc_df['Description']))
    except:
        desc_dict = {}
    
    try:
        precaution_path = os.path.join(ML_DIR, 'Datasets', 'active', 'symptom_precaution.csv')
        precaution_df = pd.read_csv(precaution_path)
        precaution_dict = {}
        for _, row in precaution_df.iterrows():
            disease = row['Disease']
            precautions = [row[f'Precaution_{i}'] for i in range(1, 5) if pd.notna(row.get(f'Precaution_{i}', ''))]
            precaution_dict[disease] = precautions
    except:
        precaution_dict = {}
    
    return severity_dict, desc_dict, precaution_dict

def get_user_symptoms(feature_names):
    """Interactive symptom input from user"""
    print("\n" + "="*60)
    print("SYMPTOM INPUT")
    print("="*60)
    print("Enter your symptoms one by one.")
    print("Type the symptom name or part of it (case-insensitive).")
    print("Type 'done' when you've entered all symptoms.")
    print("Type 'list' to see all available symptoms.")
    print("="*60)
    
    selected_symptoms = []
    
    while True:
        user_input = input("\nEnter symptom (or 'done'/'list'): ").strip().lower()
        
        if user_input == 'done':
            if len(selected_symptoms) == 0:
                print("⚠️  You must enter at least one symptom!")
                continue
            break
        
        if user_input == 'list':
            print("\nAvailable symptoms:")
            for i, symptom in enumerate(sorted(feature_names), 1):
                print(f"{i}. {symptom}")
            continue
        
        # Find matching symptoms
        matches = [s for s in feature_names if user_input in s.lower()]
        
        if len(matches) == 0:
            print(f"❌ No symptom found matching '{user_input}'")
        elif len(matches) == 1:
            if matches[0] not in selected_symptoms:
                selected_symptoms.append(matches[0])
                print(f"✓ Added: {matches[0]}")
            else:
                print(f"⚠️  Already added: {matches[0]}")
        else:
            print(f"\nFound {len(matches)} matching symptoms:")
            for i, match in enumerate(matches, 1):
                print(f"{i}. {match}")
            
            try:
                choice = int(input("Enter number to select (0 to cancel): "))
                if 1 <= choice <= len(matches):
                    symptom = matches[choice - 1]
                    if symptom not in selected_symptoms:
                        selected_symptoms.append(symptom)
                        print(f"✓ Added: {symptom}")
                    else:
                        print(f"⚠️  Already added: {symptom}")
            except ValueError:
                print("Invalid choice.")
    
    return selected_symptoms

def create_input_vector(selected_symptoms, feature_names):
    """Create binary input vector from selected symptoms"""
    input_vector = np.zeros(len(feature_names))
    for symptom in selected_symptoms:
        if symptom in feature_names:
            idx = feature_names.index(symptom)
            input_vector[idx] = 1
    return input_vector.reshape(1, -1)

def predict_disease(model, input_vector, top_n=3):
    """Predict disease and return top predictions with probabilities"""
    # Get prediction probabilities if available
    if hasattr(model, 'predict_proba'):
        probabilities = model.predict_proba(input_vector)[0]
        top_indices = np.argsort(probabilities)[::-1][:top_n]
        
        predictions = []
        for idx in top_indices:
            disease = model.classes_[idx]
            confidence = probabilities[idx] * 100
            predictions.append((disease, confidence))
    else:
        # For models without probability prediction
        prediction = model.predict(input_vector)[0]
        predictions = [(prediction, 100.0)]
    
    return predictions

def display_results(predictions, desc_dict, precaution_dict):
    """Display prediction results with descriptions and precautions"""
    print("\n" + "="*60)
    print("PREDICTION RESULTS")
    print("="*60)
    
    for i, (disease, confidence) in enumerate(predictions, 1):
        print(f"\n{i}. {disease}")
        print(f"   Confidence: {confidence:.2f}%")
        
        if disease in desc_dict:
            print(f"\n   Description:")
            print(f"   {desc_dict[disease]}")
        
        if disease in precaution_dict:
            print(f"\n   Recommended Precautions:")
            for j, precaution in enumerate(precaution_dict[disease], 1):
                print(f"   {j}. {precaution}")
        
        print("-" * 60)

def main():
    print("="*60)
    print("DISEASE PREDICTION SYSTEM")
    print("="*60)
    
    # Load model
    print("\nLoading trained model...")
    try:
        model, feature_names = load_model('disease_predictor.pkl')
        print("✓ Model loaded successfully!")
    except FileNotFoundError:
        print("❌ Error: Model file not found!")
        print("Please run train_model.py first to train the model.")
        return
    
    # Load additional information
    severity_dict, desc_dict, precaution_dict = load_symptom_info()
    
    while True:
        # Get symptoms from user
        selected_symptoms = get_user_symptoms(feature_names)
        
        print(f"\n✓ You selected {len(selected_symptoms)} symptoms:")
        for symptom in selected_symptoms:
            severity = severity_dict.get(symptom, 'N/A')
            print(f"  • {symptom} (severity: {severity})")
        
        # Create input vector
        input_vector = create_input_vector(selected_symptoms, feature_names)
        
        # Make prediction
        print("\nAnalyzing symptoms...")
        predictions = predict_disease(model, input_vector, top_n=3)
        
        # Display results
        display_results(predictions, desc_dict, precaution_dict)
        
        print("\n" + "="*60)
        print("⚠️  IMPORTANT DISCLAIMER")
        print("="*60)
        print("This is an AI-based prediction tool and should NOT replace")
        print("professional medical advice. Please consult a qualified")
        print("healthcare provider for accurate diagnosis and treatment.")
        print("="*60)
        
        # Ask if user wants to make another prediction
        another = input("\nWould you like to make another prediction? (yes/no): ").strip().lower()
        if another not in ['yes', 'y']:
            print("\nThank you for using the Disease Prediction System!")
            break

if __name__ == "__main__":
    main()
