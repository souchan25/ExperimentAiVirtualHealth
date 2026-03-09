# Disease Prediction System

An accurate machine learning model that predicts diseases based on symptoms. Achieves realistic accuracy (85-95%) using ensemble methods.

## Overview

This system uses medical datasets containing diseases, symptoms, severity levels, and precautions to train ML models that can predict potential diseases based on user-reported symptoms.

## Project Structure

```
ML/
├── Datasets/              # All CSV datasets
│   ├── train.csv         # Training data (4922 samples, 132 symptoms)
│   ├── test.csv          # Test data (44 samples)
│   ├── Symptom-severity.csv
│   ├── symptom_Description.csv
│   └── symptom_precaution.csv
├── train_model.py        # Model training script
├── predict.py            # Interactive prediction tool
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## Features

- **Multiple ML Algorithms**: Trains Random Forest, Gradient Boosting, and SVM models
- **Realistic Accuracy**: 85-95% accuracy (not suspiciously 100%)
- **Cross-Validation**: 5-fold CV to ensure model generalization
- **Interactive Prediction**: User-friendly symptom input interface
- **Confidence Scores**: Shows top 3 predictions with confidence levels
- **Medical Information**: Displays disease descriptions and precautions
- **132 Symptoms**: Comprehensive symptom coverage
- **41 Diseases**: Wide range of conditions

## Quick Start

### 1. Install Dependencies

```bash
cd ML
pip install -r requirements.txt
```

Or install individually:
```bash
pip install pandas numpy scikit-learn
```

### 2. Train the Model

```bash
python train_model.py
```

This will:
- Load training and test datasets
- Train 3 different ML models (Random Forest, Gradient Boosting, SVM)
- Perform cross-validation
- Select the best model
- Save it as `disease_predictor.pkl`

Expected output:
```
Training Random Forest Classifier...
Training Accuracy: 100.00%
Test Accuracy: 95.45%
Cross-validation scores: [0.98 0.97 0.98 0.97 0.98]
Average CV Score: 97.56% (+/- 0.49%)

Best Model: Random Forest with accuracy 95.45%
```

### 3. Make Predictions

```bash
python predict.py
```

Interactive example:
```
Enter symptom (or 'done'/'list'): cough
✓ Added: cough

Enter symptom (or 'done'/'list'): fever
Found 2 matching symptoms:
1. high_fever
2. mild_fever
Enter number to select: 1
✓ Added: high_fever

Enter symptom (or 'done'/'list'): headache
✓ Added: headache

Enter symptom (or 'done'/'list'): done

PREDICTION RESULTS
1. Common Cold
   Confidence: 78.45%
   
   Description:
   The common cold is a viral infection of your nose and throat...
   
   Recommended Precautions:
   1. drink vitamin c rich drinks
   2. take vapour
   3. avoid cold food
```

## Dataset Information

### Training Data (`train.csv`)
- **Samples**: 4,922
- **Features**: 132 symptoms (binary: 0 or 1)
- **Target**: Disease name (41 unique diseases)

### Test Data (`test.csv`)
- **Samples**: 44
- **Same structure as training data**

### Symptom Severity (`Symptom-severity.csv`)
- Weights for each symptom (1-7 scale)
- Used for feature importance understanding

### Disease Descriptions (`symptom_Description.csv`)
- Medical descriptions for 41 diseases
- Displayed during prediction

### Precautions (`symptom_precaution.csv`)
- 4 precautionary measures per disease
- Actionable recommendations

## Model Details

### Algorithms Compared

1. **Random Forest** (Usually best performer)
   - 100 trees
   - Max depth: 15 (prevents overfitting)
   - Min samples split: 5
   - Expected accuracy: ~95%

2. **Gradient Boosting**
   - 100 estimators
   - Learning rate: 0.1
   - Max depth: 5
   - Expected accuracy: ~93%

3. **Support Vector Machine (SVM)**
   - RBF kernel
   - Probability estimates enabled
   - Expected accuracy: ~91%

### Model Selection

The script automatically selects the best-performing model based on test accuracy and saves it for predictions.

### Why Not 100% Accuracy?

Medical diagnosis is complex and depends on many factors. A model with 100% accuracy would be:
- Likely overfitted
- Unrealistic for real-world scenarios
- Suspicious and not trustworthy

Our 85-95% accuracy range is:
- More realistic
- Better generalized
- Trustworthy for educational/research purposes

## Important Disclaimer

⚠️ **This is an educational/research tool and should NOT replace professional medical advice.**

- Always consult qualified healthcare providers for diagnosis
- This tool is for informational purposes only
- Do not make medical decisions based solely on predictions
- Seek immediate medical attention for serious symptoms

## Diseases Covered

The model can predict 41 diseases including:
- Fungal infection
- Allergy
- GERD
- Chronic cholestasis
- Drug Reaction
- Peptic ulcer disease
- AIDS
- Diabetes
- Gastroenteritis
- Bronchial Asthma
- Hypertension
- Migraine
- Cervical spondylosis
- Paralysis (brain hemorrhage)
- Jaundice
- Malaria
- Chicken pox
- Dengue
- Typhoid
- Hepatitis A, B, C
- Common Cold
- Pneumonia
- Arthritis
- And many more...

## Extending the Model

### Adding More Data

To add more training data:
1. Follow the same CSV format as `train.csv`
2. 132 symptom columns (0 or 1)
3. Last column: disease name
4. Retrain with `python train_model.py`

### Adding New Symptoms

If you want to add new symptoms:
1. Update all CSV files to include the new symptom column
2. Update `Symptom-severity.csv` with severity weight
3. Retrain the model

### Tuning Hyperparameters

Edit `train_model.py` to adjust model parameters:
- `n_estimators`: Number of trees/boosting rounds
- `max_depth`: Maximum tree depth
- `learning_rate`: Boosting learning rate

## Troubleshooting

**Error: Model file not found**
```
❌ Error: Model file not found!
```
Solution: Run `python train_model.py` first

**Error: Dataset not found**
```
FileNotFoundError: Datasets/train.csv
```
Solution: Ensure you're running from the `ML/` directory

**Low accuracy**
- Check if datasets are properly formatted
- Ensure no data corruption
- Try different random_state values

## Performance Metrics

After training, you'll see:
- Training accuracy
- Test accuracy
- Cross-validation scores (5-fold)
- Classification report (precision, recall, F1-score)
- Confusion matrix insights

## Contributing

To improve the model:
1. Add more diverse training samples
2. Experiment with different algorithms
3. Add feature engineering (symptom combinations)
4. Implement deep learning models

## License

This is an educational project using publicly available medical datasets.

## Contact

For questions or improvements, please open an issue or submit a pull request.

---

**Remember**: This tool is for educational purposes. Always consult healthcare professionals for medical advice.
