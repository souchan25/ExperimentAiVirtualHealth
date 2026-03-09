from pathlib import Path
import pickle
import numpy as np
import pandas as pd
from typing import Dict, List
from ..config import settings

class MLPredictor:
    def __init__(self):
        self.model = None
        self.feature_names = []
        self.severity_dict = {}
        self.description_dict = {}
        self.precaution_dict = {}
        self._load_model()
        self._load_metadata()

    def _resolve_existing_path(self, configured_path: str) -> Path:
        """Resolve configured ML paths across common project layouts."""
        raw = Path(configured_path)
        if raw.is_absolute() and raw.exists():
            return raw

        service_file = Path(__file__).resolve()
        fastapi_root = service_file.parents[2]
        workspace_root = service_file.parents[3]

        candidates = [
            Path.cwd() / raw,
            fastapi_root / raw,
            workspace_root / raw,
        ]

        for candidate in candidates:
            if candidate.exists():
                return candidate

        return raw

    def _load_model(self):
        model_path = self._resolve_existing_path(settings.ML_MODEL_PATH)
        if not model_path.exists():
            print(f"ML model not found at '{model_path}'. Using fallback prediction mode.")
            return
        
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            self.model = model_data['model']
            self.feature_names = model_data['feature_names']
        except Exception as e:
            print(f"Failed to load ML model from '{model_path}': {e}")

    def _load_metadata(self):
        datasets_path = self._resolve_existing_path(settings.ML_DATASETS_PATH)
        if not datasets_path.exists():
            print(f"ML datasets path not found at '{datasets_path}'. Continuing without metadata.")
            return

        try:
            # Severity
            severity_path = datasets_path / 'Symptom-severity.csv'
            if severity_path.exists():
                df = pd.read_csv(severity_path)
                self.severity_dict = dict(zip(df['Symptom'], df['weight']))
            
            # Descriptions
            desc_path = datasets_path / 'symptom_Description.csv'
            if desc_path.exists():
                df = pd.read_csv(desc_path)
                self.description_dict = dict(zip(df['Disease'], df['Description']))
            
            # Precautions
            prec_path = datasets_path / 'symptom_precaution.csv'
            if prec_path.exists():
                df = pd.read_csv(prec_path)
                for _, row in df.iterrows():
                    disease = row['Disease']
                    precautions = [row[f'Precaution_{i}'] for i in range(1, 5) if pd.notna(row.get(f'Precaution_{i}', ''))]
                    self.precaution_dict[disease] = precautions
        except Exception as e:
            print(f"Failed to load ML metadata from '{datasets_path}': {e}")

    def predict(self, symptoms: List[str]) -> Dict:
        # Retry lazy loading so the service can recover after dependency/path fixes
        # without requiring a process restart.
        if not self.model or not self.feature_names:
            self._load_model()
            if not self.description_dict and not self.precaution_dict:
                self._load_metadata()

        if not self.model or not self.feature_names:
            return {
                "predicted_disease": "Model unavailable",
                "confidence_score": 0.0,
                "top_predictions": [],
                "description": "",
                "precautions": [],
            }

        normalized = [s.lower().replace(' ', '_') for s in symptoms]
        input_vector = np.zeros(len(self.feature_names))
        
        for symptom in normalized:
            if symptom in self.feature_names:
                idx = self.feature_names.index(symptom)
                input_vector[idx] = 1

        prediction = self.model.predict(input_vector.reshape(1, -1))[0]
        confidence = 0.0
        top_predictions = []

        if hasattr(self.model, 'predict_proba'):
            proba = self.model.predict_proba(input_vector.reshape(1, -1))[0]
            top_3_idx = np.argsort(proba)[::-1][:3]
            for idx in top_3_idx:
                top_predictions.append({
                    "disease": self.model.classes_[idx],
                    "confidence": float(proba[idx])
                })
            confidence = top_predictions[0]['confidence']
        
        return {
            "predicted_disease": prediction,
            "confidence_score": confidence,
            "top_predictions": top_predictions,
            "description": self.description_dict.get(prediction, ""),
            "precautions": self.precaution_dict.get(prediction, [])
        }

ml_predictor = MLPredictor()
