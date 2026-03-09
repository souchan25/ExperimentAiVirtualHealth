# FastAPI ↔ Django Model Comparison

> **Context**: Migrated from Django to FastAPI, connecting to the same Supabase PostgreSQL database. This doc tracks all model/table differences.

---

## Table Overview

| #   | Table Name           | Django?              | FastAPI?              | Status                                  |
| --- | -------------------- | -------------------- | --------------------- | --------------------------------------- |
| 1   | `users`              | ✅ `CustomUser`      | ✅ `User`             | ✅ Synced                               |
| 2   | `symptom_records`    | ✅ `SymptomRecord`   | ✅ `SymptomRecord`    | ⚠️ FastAPI adds `status`, `staff_notes` |
| 3   | `follow_ups`         | ✅ `FollowUp`        | ✅ `FollowUp`         | ✅ Match                                |
| 4   | `chat_sessions`      | ✅ `ChatSession`     | ✅ `ChatSession`      | ✅ Match                                |
| 5   | `health_insights`    | ✅ `HealthInsight`   | ✅ `HealthInsight`    | ✅ Synced                               |
| 6   | `consent_logs`       | ✅ `ConsentLog`      | ✅ `ConsentLog`       | ✅ Match                                |
| 7   | `audit_logs`         | ✅ `AuditLog`        | ✅ `AuditLog`         | ✅ Match                                |
| 8   | `department_stats`   | ✅ `DepartmentStats` | ✅ `DepartmentStats`  | ✅ Match                                |
| 9   | `emergency_alerts`   | ✅ `EmergencyAlert`  | ✅ `EmergencyAlert`   | ✅ Match                                |
| 10  | `medications`        | ✅ `Medication`      | ✅ `Medication`       | ✅ Match                                |
| 11  | `medication_logs`    | ✅ `MedicationLog`   | ✅ `MedicationLog`    | ✅ Match                                |
| 12  | `messages`           | ✅ `Message`         | ✅ `Message`          | ✅ Match                                |
| 13  | `appointments`       | ✅ `Appointment`     | ✅ `Appointment`      | ✅ Match                                |
| 14  | `health_profiles`    | ❌                   | ✅ `HealthProfile`    | 🆕 New table                            |
| 15  | `medical_documents`  | ❌                   | ✅ `MedicalDocument`  | 🆕 New table                            |
| 16  | `excuse_slips`       | ❌                   | ✅ `ExcuseSlip`       | 🆕 New table                            |
| 17  | `inventory_items`    | ❌                   | ✅ `InventoryItem`    | 🆕 New table                            |
| 18  | `stock_transactions` | ❌                   | ✅ `StockTransaction` | 🆕 New table                            |
| 19  | `wellness_checkins`  | ❌                   | ✅ `WellnessCheckin`  | 🆕 New table                            |
| 20  | `notifications`      | ❌                   | ✅ `Notification`     | 🆕 New table                            |
| 21  | `first_aid_articles` | ❌                   | ✅ `FirstAidArticle`  | 🆕 New table                            |
| 22  | `campus_alerts`      | ❌                   | ✅ `CampusAlert`      | 🆕 New table                            |

---

## Field-Level Differences (Shared Tables)

### `users` table

| Field                | Django                             | FastAPI                 | Note     |
| -------------------- | ---------------------------------- | ----------------------- | -------- |
| `id`                 | Auto UUID (pk)                     | `UUID(as_uuid=True)` pk | ✅       |
| `school_id`          | `CharField(20)` unique             | `String(20)` unique     | ✅       |
| `name`               | `CharField(150)`                   | `String(150)`           | ✅       |
| `role`               | `CharField(10)`                    | `String(10)`            | ✅       |
| `department`         | `CharField(100)`                   | `String(100)`           | ✅       |
| `cpsu_address`       | `CharField(255)`                   | `String(255)`           | ✅       |
| `email`              | `EmailField` unique                | `String(255)` unique    | ✅       |
| `password`           | Django hashed                      | `String(255)`           | ✅       |
| `is_active`          | `BooleanField`                     | `Boolean`               | ✅       |
| `is_staff`           | `BooleanField`                     | `Boolean`               | ✅       |
| `is_superuser`       | `BooleanField` (PermissionsMixin)  | `Boolean`               | ✅ Fixed |
| `date_joined`        | `DateTimeField`                    | `DateTime`              | ✅       |
| `last_login`         | `DateTimeField` (AbstractBaseUser) | `DateTime` nullable     | ✅ Fixed |
| `data_consent_given` | `BooleanField`                     | `Boolean`               | ✅       |
| `consent_date`       | `DateTimeField` nullable           | `DateTime` nullable     | ✅       |
| `has_seen_tour`      | `BooleanField`                     | `Boolean`               | ✅       |

### `symptom_records` table

| Field         | Django           | FastAPI                        | Note          |
| ------------- | ---------------- | ------------------------------ | ------------- |
| `status`      | ❌ Not in Django | `String(20)` default "pending" | 🆕 New column |
| `staff_notes` | ❌ Not in Django | `Text` nullable                | 🆕 New column |

> All other fields match between Django and FastAPI.

### `health_insights` table

| Field        | Django                       | FastAPI                 | Note              |
| ------------ | ---------------------------- | ----------------------- | ----------------- |
| `session_id` | `UUIDField` (plain, indexed) | `UUID` (plain, indexed) | ✅ Fixed (was FK) |

---

## New Tables (FastAPI Only)

These tables need to be created in Supabase. Run `python create_tables.py` to auto-create them.

### `health_profiles`

One-to-one with `users`. Stores age, sex, blood type, allergies, pre-existing conditions, emergency contacts.

### `medical_documents`

Uploaded documents (lab results, medical certificates) with AI extraction data and staff review workflow.

### `excuse_slips`

Clinic-issued excuse slips linked to students and symptom records, with date range and validity tracking.

### `inventory_items`

Clinic inventory (medicines, supplies, equipment) with stock levels and restock alerts.

### `stock_transactions`

Audit trail for inventory changes (additions, deductions, adjustments) by staff.

### `wellness_checkins`

Daily student wellness check-ins: mood, stress level, sleep hours, physical activity.

### `notifications`

In-app notifications (medication reminders, system alerts, wellness tips, emergency alerts).

### `first_aid_articles`

Published first-aid and health education content, categorized and tagged.

### `campus_alerts`

Campus-wide health alerts (e.g., outbreaks, clinic closures) with severity and role targeting.

---

## How to Sync

```bash
# From the FastAPI project root:
python create_tables.py
```

This will create only the **new tables** — existing tables are left untouched.

> **Note**: For existing tables that need new columns (like `status` on `symptom_records`), you'll need to add them manually in Supabase or use Alembic migrations.
