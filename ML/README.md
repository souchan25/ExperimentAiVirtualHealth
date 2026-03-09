# Disease Prediction System

A clean, organized ML system that predicts diseases from symptoms with realistic accuracy.

## ��� Folder Structure

```
ML/
├── scripts/         Python scripts (5 files)
│   ├── train_model_realistic.py ⭐ 85-95% accuracy
│   ├── predict.py               ⭐ Make predictions
│   ├── test_model.py            Test the model
│   ├── train_model_v2.py
│   └── train_model.py
│
├── models/          Trained models (2 files)
│   ├── disease_predictor.pkl
│   └── disease_predictor_v2.pkl
│
├── docs/            Documentation (6 files)
│   ├── README.md
│   ├── QUICKSTART.md
│   ├── SUMMARY.md
│   └── requirements.txt
│
└── Datasets/
    ├── active/      Currently used (6 CSV files)
    ├── archive/     Archived datasets (6 files)
    └── alternative/ Large dataset (246K samples)
```

## ��� Quick Start

### 1. Install
```bash
pip install pandas numpy scikit-learn
```

### 2. Test (verify it works)
```bash
python scripts/test_model.py
```

### 3. Make Predictions
```bash
python scripts/predict.py
```

Enter symptoms interactively and get disease predictions!

### 4. Train New Model (optional)
```bash
python scripts/train_model_realistic.py  # 85-95% accuracy
```

## ✨ Features

- ��� Predicts 41 diseases
- ��� Tracks 132 symptoms
- ��� 3 ML algorithms (RF, GB, SVM)
- ��� Realistic accuracy (85-95%)
- ��� Interactive symptom input
- ��� Disease descriptions & precautions

## ��� Documentation

- Full docs: `docs/README.md`
- Quick start: `docs/QUICKSTART.md`
- Project summary: `docs/SUMMARY.md`
- Folder guide: `FOLDER_GUIDE.txt`

## ⚠️ Disclaimer

Educational tool only. Not for medical diagnosis.
Always consult healthcare professionals.

---

**Everything is organized and working!** ���
