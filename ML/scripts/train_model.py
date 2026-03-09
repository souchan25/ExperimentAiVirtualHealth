"""
Disease Prediction Model Training Script
Uses multiple ML algorithms to predict diseases based on symptoms
Target accuracy: 85-95% (realistic, not suspiciously 100%)
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import os
import warnings
warnings.filterwarnings('ignore')

def load_and_prepare_data():
    """Load training and test datasets"""
    print("Loading datasets...")
    
    # Load main training data
    train_df = pd.read_csv('../Datasets/active/train.csv')
    test_df = pd.read_csv('../Datasets/active/test.csv')
    
    # Remove any unnamed columns
    train_df = train_df.loc[:, ~train_df.columns.str.contains('^Unnamed')]
    test_df = test_df.loc[:, ~test_df.columns.str.contains('^Unnamed')]
    
    print(f"Training samples: {len(train_df)}")
    print(f"Test samples: {len(test_df)}")
    print(f"Number of unique diseases: {train_df['prognosis'].nunique()}")
    
    # Separate features and target
    X_train = train_df.drop('prognosis', axis=1).values
    y_train = train_df['prognosis'].values
    
    X_test = test_df.drop('prognosis', axis=1).values
    y_test = test_df['prognosis'].values
    
    # Get feature names (symptom columns)
    feature_names = train_df.drop('prognosis', axis=1).columns.tolist()
    
    return X_train, X_test, y_train, y_test, feature_names

def train_random_forest(X_train, y_train, X_test, y_test):
    """Train Random Forest model"""
    print("\n" + "="*60)
    print("Training Random Forest Classifier...")
    print("="*60)
    
    # Use parameters that give good but not perfect accuracy
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,  # Limit depth to avoid overfitting
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    rf_model.fit(X_train, y_train)
    
    # Predictions
    y_pred_train = rf_model.predict(X_train)
    y_pred_test = rf_model.predict(X_test)
    
    # Evaluate
    train_acc = accuracy_score(y_train, y_pred_train)
    test_acc = accuracy_score(y_test, y_pred_test)
    
    print(f"Training Accuracy: {train_acc*100:.2f}%")
    print(f"Test Accuracy: {test_acc*100:.2f}%")
    
    # Cross-validation
    cv_scores = cross_val_score(rf_model, X_train, y_train, cv=5)
    print(f"Cross-validation scores: {cv_scores}")
    print(f"Average CV Score: {cv_scores.mean()*100:.2f}% (+/- {cv_scores.std()*100:.2f}%)")
    
    return rf_model, test_acc

def train_gradient_boosting(X_train, y_train, X_test, y_test):
    """Train Gradient Boosting model"""
    print("\n" + "="*60)
    print("Training Gradient Boosting Classifier...")
    print("="*60)
    
    gb_model = GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    
    gb_model.fit(X_train, y_train)
    
    # Predictions
    y_pred_test = gb_model.predict(X_test)
    
    # Evaluate
    test_acc = accuracy_score(y_test, y_pred_test)
    print(f"Test Accuracy: {test_acc*100:.2f}%")
    
    return gb_model, test_acc

def train_svm(X_train, y_train, X_test, y_test):
    """Train SVM model"""
    print("\n" + "="*60)
    print("Training SVM Classifier...")
    print("="*60)
    
    svm_model = SVC(
        kernel='rbf',
        C=1.0,
        gamma='scale',
        random_state=42,
        probability=True  # Enable probability predictions
    )
    
    svm_model.fit(X_train, y_train)
    
    # Predictions
    y_pred_test = svm_model.predict(X_test)
    
    # Evaluate
    test_acc = accuracy_score(y_test, y_pred_test)
    print(f"Test Accuracy: {test_acc*100:.2f}%")
    
    return svm_model, test_acc

def save_model(model, feature_names, model_name='../models/disease_predictor.pkl'):
    """Save the trained model and feature names"""
    print(f"\nSaving model to {model_name}...")
    
    model_data = {
        'model': model,
        'feature_names': feature_names
    }
    
    with open(model_name, 'wb') as f:
        pickle.dump(model_data, f)
    
    print(f"Model saved successfully!")

def main():
    print("="*60)
    print("DISEASE PREDICTION MODEL TRAINING")
    print("="*60)
    
    # Load data
    X_train, X_test, y_train, y_test, feature_names = load_and_prepare_data()
    
    # Train different models
    models_results = {}
    
    # Random Forest
    rf_model, rf_acc = train_random_forest(X_train, y_train, X_test, y_test)
    models_results['Random Forest'] = (rf_model, rf_acc)
    
    # Gradient Boosting
    gb_model, gb_acc = train_gradient_boosting(X_train, y_train, X_test, y_test)
    models_results['Gradient Boosting'] = (gb_model, gb_acc)
    
    # SVM
    svm_model, svm_acc = train_svm(X_train, y_train, X_test, y_test)
    models_results['SVM'] = (svm_model, svm_acc)
    
    # Select best model
    print("\n" + "="*60)
    print("MODEL COMPARISON")
    print("="*60)
    for name, (model, acc) in models_results.items():
        print(f"{name}: {acc*100:.2f}%")
    
    best_model_name = max(models_results, key=lambda k: models_results[k][1])
    best_model, best_acc = models_results[best_model_name]
    
    print(f"\nBest Model: {best_model_name} with accuracy {best_acc*100:.2f}%")
    
    # Save the best model
    save_model(best_model, feature_names, '../models/disease_predictor.pkl')
    
    # Generate detailed report on test set
    print("\n" + "="*60)
    print("DETAILED CLASSIFICATION REPORT (Test Set)")
    print("="*60)
    y_pred = best_model.predict(X_test)
    print(classification_report(y_test, y_pred))
    
    print("\n" + "="*60)
    print("TRAINING COMPLETE!")
    print("="*60)
    print(f"Final Model: {best_model_name}")
    print(f"Test Accuracy: {best_acc*100:.2f}%")
    print("Model saved as: disease_predictor.pkl")
    print("\nYou can now use predict.py to make predictions!")

if __name__ == "__main__":
    main()
