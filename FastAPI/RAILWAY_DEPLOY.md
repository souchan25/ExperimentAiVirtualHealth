# Deploying to Railway

This FastAPI backend is configured for Railway deployment.

## Prerequisites

✅ PostgreSQL database (Supabase recommended)
✅ Cloudinary account for file uploads
✅ All API keys (OpenAI, Gemini, etc.)

## Quick Deploy Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `FastAPI` directory as root

### 3. Configure Environment Variables

Add these in Railway dashboard (Settings → Variables):

#### Database (Supabase)
```
USE_POSTGRESQL=true
USE_SQLITE=false
DB_HOST=your-supabase-host.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=postgres
DB_SSLMODE=require
```

#### Security
```
SECRET_KEY=your-super-secret-key-generate-a-strong-one
DEBUG=false
AUTO_CREATE_TABLES=false
```

#### CORS Origins (add your frontend URLs)
```
CORS_ALLOWED_ORIGINS=["https://your-frontend.com","https://your-mobile-app.com"]
```

#### Cloudinary (Required for file uploads)
```
CLOUD_NAME=your-cloud-name
API_KEY=your-api-key
API_SECRET=your-api-secret
```

#### AI Services (Optional but recommended)
```
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
GROQ_API_KEY=...
COHERE_API_KEY=...
```

#### Email Service (Brevo/SMTP)
```
SMTP_SERVER=smtp-relay.brevo.com
PORT=587
LOGIN=your-brevo-email
SMTP_KEY=your-brevo-key
EMAILS_FROM_EMAIL=your-email@example.com
EMAILS_FROM_NAME=CPSU Health Assistant
```

#### ML Settings (defaults should work)
```
ML_MODEL_PATH=ML/models/disease_predictor_v2.pkl
ML_DATASETS_PATH=ML/Datasets/active
```

### 4. Initialize Database

After first deployment, run this command in Railway's terminal to create tables:

```bash
python create_tables.py
```

Or set `AUTO_CREATE_TABLES=true` for automatic table creation (less safe for production).

### 5. Verify Deployment

- Check the deployment logs for errors
- Visit `https://your-app.up.railway.app/` - should show welcome message
- Visit `https://your-app.up.railway.app/docs` - should show API documentation
- Test `/health` endpoint

## Important Notes

### File Storage
- ✅ All file uploads use **Cloudinary** (persistent)
- ✅ No local filesystem dependencies
- ✅ Logo serves from `/assets/cpsu-logo.png`

### Database
- ✅ Uses **PostgreSQL** via Supabase (persistent)
- ✅ No SQLite (ephemeral on Railway)

### ML Models
- ✅ ML models (2.3MB) should be committed to repo
- ✅ If missing, ML service gracefully falls back
- ✅ Paths resolve automatically across deployment environments

### Scaling
- Railway auto-scales based on traffic
- PostgreSQL connection pooling configured (20 connections)
- Async SQLAlchemy for concurrent requests

## Troubleshooting

### "Module not found" errors
- Ensure `requirements.txt` includes all dependencies
- Railway automatically installs from `requirements.txt`

### Database connection errors
- Verify Supabase credentials
- Check SSL mode is set to `require`
- Ensure Supabase allows connections from Railway IPs

### File upload failures
- Verify Cloudinary credentials
- Check Cloudinary storage quota

### ML prediction not working
- Ensure `ML/` directory structure is preserved in repo
- Check model files are committed (not in .gitignore)

## Files Created for Railway

- `Procfile` - Defines the web process command
- `railway.json` - Railway configuration with health checks
- `assets/cpsu-logo.png` - Logo for PDF generation (copied from Assets/)

## API Documentation

Once deployed, access interactive API docs at:
- Swagger UI: `https://your-app.up.railway.app/docs`
- ReDoc: `https://your-app.up.railway.app/redoc`
