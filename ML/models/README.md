# ML Models Directory

This directory contains trained machine learning models for disease prediction.

## Files (Generated, not in Git)

- `disease_predictor.pkl` - Original ML model
- `disease_predictor_v2.pkl` - Enhanced ML model (recommended)

## How to Generate Models

```bash
cd ML/scripts
python train_model_realistic.py  # Generates disease_predictor_v2.pkl
```

**Note:** Models are excluded from git due to size (~1-5 MB each). Train locally before running Django server.

## Model Format

```python
{
    'model': sklearn_classifier,
    'feature_names': list_of_132_symptoms
}
```

See `Django/clinic/ml_service.py` for usage.
