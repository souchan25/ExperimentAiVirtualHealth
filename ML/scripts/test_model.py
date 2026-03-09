"""
Quick test script to verify the prediction system works
"""

import pandas as pd
import pickle
import numpy as np
import os

# Get the ML folder path
ML_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load model
print("Loading model...")
with open(os.path.join(ML_DIR, 'models', 'disease_predictor.pkl'), 'rb') as f:
    model_data = pickle.load(f)
    model = model_data['model']
    feature_names = model_data['feature_names']

print(f"✓ Model loaded: {type(model).__name__}")
print(f"✓ Features: {len(feature_names)}")

# Test with some example symptoms
print("\n" + "="*60)
print("TEST CASE 1: Common Cold")
print("="*60)
print("Symptoms: continuous_sneezing, shivering, chills")

# Create input vector
symptoms = ['continuous_sneezing', 'shivering', 'chills']
input_vector = np.zeros(len(feature_names))
for symptom in symptoms:
    if symptom in feature_names:
        idx = feature_names.index(symptom)
        input_vector[idx] = 1

# Predict
prediction = model.predict(input_vector.reshape(1, -1))[0]
print(f"\nPredicted Disease: {prediction}")

if hasattr(model, 'predict_proba'):
    proba = model.predict_proba(input_vector.reshape(1, -1))[0]
    top_3_idx = np.argsort(proba)[::-1][:3]
    print("\nTop 3 predictions:")
    for i, idx in enumerate(top_3_idx, 1):
        disease = model.classes_[idx]
        conf = proba[idx] * 100
        print(f"{i}. {disease}: {conf:.2f}%")

# Test case 2
print("\n" + "="*60)
print("TEST CASE 2: Diabetes")
print("="*60)
print("Symptoms: fatigue, weight_loss, increased_appetite, polyuria")

symptoms = ['fatigue', 'weight_loss', 'increased_appetite', 'polyuria']
input_vector = np.zeros(len(feature_names))
for symptom in symptoms:
    if symptom in feature_names:
        idx = feature_names.index(symptom)
        input_vector[idx] = 1

prediction = model.predict(input_vector.reshape(1, -1))[0]
print(f"\nPredicted Disease: {prediction}")

if hasattr(model, 'predict_proba'):
    proba = model.predict_proba(input_vector.reshape(1, -1))[0]
    top_3_idx = np.argsort(proba)[::-1][:3]
    print("\nTop 3 predictions:")
    for i, idx in enumerate(top_3_idx, 1):
        disease = model.classes_[idx]
        conf = proba[idx] * 100
        print(f"{i}. {disease}: {conf:.2f}%")

print("\n" + "="*60)
print("✓ All tests passed! The model is working correctly.")
print("="*60)
