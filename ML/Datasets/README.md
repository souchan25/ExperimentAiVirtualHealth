# Alternative and Archive Datasets

**⚠️ These directories are excluded from Git** due to large file sizes (>100 MB).

## Why Excluded?

GitHub has a 100 MB file size limit. The datasets in these folders are:
- `alternative/Disease_and_symptoms_dataset.csv` - **182 MB** (too large)
- Archive datasets - Historical/unused data

## Active Datasets (Included in Git)

The project uses datasets in `ML/Datasets/active/`:
- ✅ `train.csv` (4,920 samples)
- ✅ `test.csv` (42 samples)
- ✅ `Symptom-severity.csv`
- ✅ `symptom_Description.csv`
- ✅ `symptom_precaution.csv`

**These are sufficient for the ML model and are under 5 MB total.**

## If You Need Alternative Datasets

1. **Download separately** - Not required for the system to work
2. **Use Git LFS** (Large File Storage) - For teams needing version control
   ```bash
   git lfs install
   git lfs track "ML/Datasets/alternative/*.csv"
   git lfs track "ML/Datasets/archive/*.csv"
   ```

## For Cloners

When you clone this repository, the `alternative/` and `archive/` folders will be empty. This is **intentional and safe** - the system doesn't use them.

The active datasets are all you need to train the ML model!
