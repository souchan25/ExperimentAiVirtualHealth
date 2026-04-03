# CPSU Health System: Role-Based Features

This document outlines the core features available to Students, Staff (Nurses/Doctors), and Administrators within the CPSU Health platform based on the current system capabilities.

---

## 🌐 System-Wide Features

- **Multilingual Support:** Contextual translation functionality integrated throughout the UI (English & Filipino), with LLM chat responses available in English, Tagalog, and Hiligaynon.
- **Notification Center:** Real-time push updates with unread counters and periodic polling (every 30s).
- **Floating Assistant:** Role-aware, contextual AI system guide for navigating the application — powered by multi-provider LLM fallback (Groq, Mistral, Gemini, OpenRouter, GitHub Models, ZenMux).
- **Consent Management:** Built-in gate component (ConsentGate) enforcing Data Privacy Act of 2012 compliance before students can access the platform.
- **System Tour:** Guided, role-specific UI walkthroughs for onboarding using step-by-step interactive tooltips (powered by React Joyride).
- **Campus Alert Banner:** Rotating, severity-coded alert banners (Low/Medium/High/Critical) displayed across all internal pages.
- **Dark Mode:** Persistent, toggleable dark theme support across the student dashboard and internal layouts.
- **Authentication & Authorization:** JWT-based login, registration, forgot/reset password flows, and role-based route protection (student, staff, admin).
- **Landing Page:** Public-facing marketing site with Hero, Features, Stats, ForWho, HowItWorks, About, FAQ, and CTA sections.

---

## 🎓 Student Features

Empowering students to take control of their health through AI-driven tools and centralized medical records.

- **Student Dashboard:**
  - Time-aware personalized greeting (Morning/Afternoon/Evening) with dynamic icons.
  - **Wellness Score Ring:** Animated SVG ring displaying a computed wellness score (0–100) derived from mood, stress, sleep, and physical activity.
  - **Quick Stats Row:** At-a-glance cards for Total Assessments, Active Medications, Last Check-in date, and Unread Notifications.
  - **Quick Action Cards:** One-tap access to Wellness Check, AI Symptom Assessment, AI Health Chat, and Medical Logs — with horizontal scroll on mobile and grid on desktop.
  - **AI Health Insights Panel:** Personalized health overview with AI-generated awareness messages, general wellness tips, and 7-day Mood Trend Sparkline chart (SVG).
  - **Recent Assessments Feed:** Scrollable list of the latest AI symptom assessment results with predicted disease and symptom details, plus empty-state illustrations for new users.
  - **Upcoming Appointment Widget:** Shows the next scheduled appointment with countdown timer and quick link to full appointments page.
  - **Active Medication Sidebar:** Displays currently active prescriptions with direct link to the Pillbox Manager.
  - **SOS Emergency Button:** Hold-to-trigger (2-second press) emergency mechanism with real-time GPS location sharing. Includes progress bar fill animation, status indicators (Checking/Sending/Active Case), and toast notifications.
  - **Live SOS Map:** Interactive Leaflet map displaying when emergency is active — shows real-time student location, clinic marker, fullscreen toggle, and auto-follow mode.
  - **Skeleton Loading States:** Animated placeholders during data fetches across all dashboard widgets.
  - **Toast Notifications:** Animated in-app notification popups for success/error feedback.
- **Student Profile & Settings:** Manage personal details (name, department, email), health profile (age, sex, blood type, allergies, pre-existing conditions, emergency contact), notification preferences (email/push toggles), language selection, and password management.
- **AI Symptom Assessment (Symptom Checker):**
  - Log symptoms via an interactive form and receive ML-powered disease predictions with confidence scores.
  - Dual-engine pipeline: ML model (pickle-based classifier with 132 symptom features) generates initial prediction, then LLM refines diagnosis through clinical verification.
  - Displays top-3 disease predictions with confidence percentages, disease descriptions, and recommended precautions.
  - Records are saved with full metadata: symptoms, duration, severity, patient demographics, communicability, ICD-10 codes, and referral flags.
- **AI Health Assistant (Virtual Chat):**
  - Conversational UI for discussing health concerns with an AI virtual nurse.
  - Two-phase consultation flow: interactive symptom gathering (one question at a time) → structured JSON assessment with conditions, triage level, recommendations, red flags, and citations.
  - Health-context-aware: incorporates patient's health profile, allergies, and recent symptom history into responses.
  - Chat sessions are logged with duration, topics discussed, and generated health insights.
  - Automatic clinical data extraction from chat history to create symptom records.
- **Wellness Check-in:**
  - Multi-step modal (3 steps): Mood selection (Happy/Neutral/Stressed/Sad/Anxious) → Daily stats (stress level 1–10, sleep hours, physical activity level) → Free-text notes.
  - Data feeds into the Wellness Score Ring, 7-day mood sparkline, and AI personal trend analysis.
  - Tracks sleep quality (Good/Fair/Poor).
- **Medication Management (Pillbox Manager):** Track digital prescriptions with name, dosage, frequency, schedule times, start/end dates, instructions, and purpose. Medication logs track adherence (taken/missed/skipped) with reminders.
- **Personal Medical Records & Consultations:** Historical logs of AI symptom assessments, clinical encounters, staff diagnoses, and final diagnoses — with status tracking (Pending, Under Review, Referred, Resolved, Closed).
- **Medical Documents:** Upload and manage medical documents (lab results, medical certificates) with AI data extraction and staff review workflow.
- **Excuse Slips:** View excuse slips issued by clinic staff linked to specific symptom records.
- **Knowledge Base (First Aid Library):** Searchable library of categorized first-aid articles and health information (Emergency, Injury, Illness, General) with tag-based filtering.
- **Appointments:** Schedule, track, and manage clinic visits with date/time selection, purpose, and status tracking (Pending/Confirmed/Cancelled).
- **Messages:** Direct internal messaging with clinic staff. Real-time message threads with read/unread indicators.
- **User Manual / Guide:** Embedded documentation for navigating platform features.

---

## 🩺 Staff Features (Nurses & Doctors)

Streamlining clinical workflows and providing data-driven tools for patient care.

- **Staff Dashboard:** High-level overview of daily clinic operations including patient count statistics, active emergency alerts with real-time response panel, and quick-access management console cards.
- **Medical Records Management:** Centralized database to view and manage comprehensive student health profiles, medical documents (with AI-extracted data review), and historical health data.
- **Consultation & Triage Engine:**
  - Full clinical queue with searchable, filterable list (by name, condition, school ID, symptom, or status).
  - Detailed review modal with tabbed interface: Clinical Review, Prescription, and Excuse Slip.
  - **Clinical Review Tab:** Editable final diagnosis, protocol status management (Pending → Under Review → Referred → Resolved), internal clinical notes, and in-modal direct messaging to the student.
  - **Prescription Tab:** Issue digital prescriptions directly from a consultation — medication name, dosage, frequency, dates, and special instructions.
  - **Excuse Slip Tab:** Generate excuse slips linked to a specific consultation with start/end dates and reason.
  - Referral management with PDF and Excel export per consultation record.
  - Quick-message student button from the consultation queue.
- **Inventory Control:** Monitor clinic supply (Medicines, Supplies, Equipment) with current stock levels, minimum stock thresholds, restock tracking, and transaction history (addition/deduction/adjustment). Links to active prescriptions for supply correlation.
- **Health Intelligence & Reporting (Health Analytics):**
  - Aggregated university health statistics: total consultations, emergency calls, triage level breakdown (Emergency/High/Moderate/Low).
  - Department Hotspot analysis with visual progress bars (students with symptoms per department).
  - Triage Level Analysis panel.
  - Export capabilities: PDF Reports and Excel Data (XLSX) exports.
- **Emergency Map (Live Emergency Navigation):**
  - Geospatial visualization of active SOS alerts on an interactive Leaflet map with real-time auto-refresh (every 15 seconds).
  - GPS coordinate parsing from student location data with fallback Nominatim geocoding.
  - **OSRM Route Navigation:** One-click driving route calculation from clinic (or staff's current location) to emergency location with distance and ETA display.
  - Staff current location tracking via browser geolocation.
  - Active alert sidebar panel with Focus and Route buttons per alert.
  - Out-of-range detection (>80km from campus) with warning indicators.
- **Appointments Management:** Oversee scheduled incoming student consultations with date/time and status management.
- **Messages:** Secure internal messaging with students for follow-ups, instructions, and consultation-related communication.
- **Settings & User Manual:** Configure staff portal parameters (notification preferences, language, password) and access system instructions.

---

## 🛡️ Admin Features

Ensuring system security, data integrity, and institutional oversight.

- **Admin Dashboard & Control Center:**
  - Institutional overview of platform activity with quick action cards (Create Staff, Manage Users, System Health, Permissions).
  - **System Activity Feed:** Real-time audit log viewer with color-coded, timestamped entries (AUTH, INFO, OK, ERR) in a terminal-style interface.
  - **Performance Card:** System health and performance metrics widget.
  - **Security Pulse:** SSL status indicator and security markers.
- **User Management:**
  - **Create Staff Modal:** Register new staff/nurse/doctor accounts with role assignment.
  - **User Management Modal:** Full directory of student and staff users with lifecycle management and role authorization controls.
  - **System Permissions Modal:** Global-level permission overrides and role-based access configuration.
  - **System Health Modal:** Live monitoring of platform infrastructure, database status, and API response metrics.
- **System Settings:** High-level global configuration via key-value settings store for underlying application parameters (SystemSettings model).
- **Security & Compliance (Audit Logging):**
  - Comprehensive AuditLog tracking: action type, model/object affected, change details (JSON), timestamps, IP address, user agent, success/failure, and error messages.
  - ConsentLog tracking for student data privacy consent with IP/user-agent records.
  - Dedicated Audit Logs page for browsing and searching historical audit trail entries.

---

## ⚙️ Technical Infrastructure

- **Frontend:** React 18 + Vite, TailwindCSS, Framer Motion animations, Leaflet maps, React Router v6.
- **Backend:** FastAPI (Python), SQLAlchemy ORM, PostgreSQL (Railway production) / SQLite (local dev).
- **AI/ML Pipeline:** Scikit-learn classifier (pickle model) for symptom-to-disease prediction + multi-provider LLM fallback chain (Groq → Mistral → Gemini → OpenRouter → GitHub Models → ZenMux) for chat, diagnosis refinement, clinical extraction, health insights, and personal trend analysis.
- **Deployment:** Railway (backend), Firebase/Vercel (frontend), Cloudinary (media), SMTP email service.
- **Data Models:** 20 database entities including Users, HealthProfiles, SymptomRecords, ChatSessions, HealthInsights, EmergencyAlerts, Medications, MedicationLogs, Messages, Appointments, AuditLogs, ConsentLogs, MedicalDocuments, ExcuseSlips, InventoryItems, StockTransactions, WellnessCheckins, Notifications, FirstAidArticles, CampusAlerts, SystemSettings, DepartmentStats, FollowUps, and UserSettings.
