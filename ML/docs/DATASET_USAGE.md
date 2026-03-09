# Dataset Usage Report

## Datasets Actually Used ✅

### 1. `train.csv` (4,920 samples)
- **Used by**: All training scripts
- **Format**: 132 symptom columns + prognosis column
- **Purpose**: Primary training data

### 2. `test.csv` (42 samples)
- **Used by**: Original training scripts
- **Format**: Same as train.csv
- **Purpose**: Original test split

### 3. `Symptom-severity.csv` (135 symptoms)
- **Used by**: `predict.py`
- **Format**: Symptom + weight (1-7)
- **Purpose**: Display severity info during predictions

### 4. `symptom_Description.csv` (43 diseases)
- **Used by**: `predict.py`
- **Format**: Disease + Description
- **Purpose**: Show disease descriptions to users

### 5. `symptom_precaution.csv` (43 diseases)
- **Used by**: `predict.py`
- **Format**: Disease + 4 precautions
- **Purpose**: Show recommended precautions to users

---

## Unused Datasets (Alternative/Supplementary) ⚠️

### 6. `dataset.csv` (4,920 × 18)
- **Format**: Disease + Symptom_1 to Symptom_17
- **Description**: Alternative format of train data (not binary encoded)
- **Status**: DUPLICATE - same data as train.csv but different format
- **Recommendation**: Can be removed (already using train.csv)

### 7. `DiseaseAndSymptoms.csv` (4,920 × 18)
- **Format**: Disease + Symptom_1 to Symptom_17
- **Description**: Identical to dataset.csv
- **Status**: DUPLICATE
- **Recommendation**: Can be removed

### 8. `Disease and symptoms dataset.csv` (246,945 × 378)
- **Format**: diseases + 377 symptom columns
- **Description**: MUCH LARGER dataset with different symptoms
- **Status**: ALTERNATIVE DATASET - could enhance model
- **Recommendation**: Keep for potential future enhancement

### 9. `Final_Augmented_dataset_Diseases_and_Symptoms.csv` (246,945 × 378)
- **Format**: diseases + 377 symptom columns
- **Description**: Identical to "Disease and symptoms dataset.csv"
- **Status**: DUPLICATE of #8
- **Recommendation**: Can be removed

### 10. `Disease precaution.csv` (41 × 5)
- **Format**: Disease + Precaution_1 to Precaution_4
- **Description**: Same as symptom_precaution.csv but different name
- **Status**: DUPLICATE (different filename only)
- **Recommendation**: Can be removed (using symptom_precaution.csv)

### 11. `Disease_symptom_and_patient_profile_dataset.csv` (349 × 10)
- **Format**: Disease + Fever + Cough + Fatigue + etc. + Outcome Variable
- **Description**: Different smaller dataset with patient profiles
- **Status**: ALTERNATIVE DATASET - has outcome variable
- **Recommendation**: Keep for potential demographic modeling

### 12. `symbipredict_2022.csv` (4,961 × 133)
- **Format**: 132 symptoms + prognosis
- **Description**: Almost identical to train.csv (41 more samples)
- **Status**: VERY SIMILAR to train.csv
- **Recommendation**: Could replace train.csv or be removed

---

## Summary

### Currently Using (6 files): ✅
1. train.csv
2. test.csv
3. Symptom-severity.csv
4. symptom_Description.csv
5. symptom_precaution.csv
6. disease-symptom-description-dataset-metadata.json

### Safe to Remove (5 files): 🗑️
1. `dataset.csv` - duplicate of train.csv (different format)
2. `DiseaseAndSymptoms.csv` - duplicate of dataset.csv
3. `Final_Augmented_dataset_Diseases_and_Symptoms.csv` - duplicate of #8
4. `Disease precaution.csv` - duplicate of symptom_precaution.csv
5. `symbipredict_2022.csv` - nearly identical to train.csv

### Keep for Future Use (2 files): 📦
1. `Disease and symptoms dataset.csv` - Much larger dataset (246K samples, 377 symptoms)
2. `Disease_symptom_and_patient_profile_dataset.csv` - Has patient demographic data

---

## Recommendations

### Option 1: Minimal Cleanup (Recommended)
Remove obvious duplicates only:
- `DiseaseAndSymptoms.csv` (exact duplicate)
- `Final_Augmented_dataset_Diseases_and_Symptoms.csv` (exact duplicate)
- `Disease precaution.csv` (duplicate filename)

### Option 2: Aggressive Cleanup
Remove all unused files, keeping only what's actively used:
- Keep: train.csv, test.csv, Symptom-severity.csv, symptom_Description.csv, symptom_precaution.csv
- Remove: Everything else

### Option 3: Archive Unused
Create a `Datasets/archive/` or `Datasets/unused/` folder and move unused datasets there.

---

## What Would You Like to Do?

1. **Remove duplicates only** (safest - removes 3-5 files)
2. **Remove all unused** (aggressive - removes 7 files)
3. **Archive unused** (safest - keeps everything but organized)
4. **Keep everything** (no cleanup)
