# Lifodial - Getting Started (Local Setup)

Follow these commands to get the Lifodial AI Voice Receptionist running locally with minimum setup (SQLite + In-memory store).

## 1. Setup (Run once)
```bash
# Install backend dependencies
pip install -r requirements.txt

# Initialise environment
cp .env.example .env
# IMPORTANT: Edit .env and add your GEMINI_API_KEY from aistudio.google.com
```

## 2. Start Backend
Separate terminal:
```bash
uvicorn backend.main:app --reload --port 8000
```
*Expected: "✅ Database ready (SQLite)" message.*

## 3. Start Frontend
Separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*Opens at: http://localhost:5173*

## 4. Test Full Flow
1. **Super Admin Access**:
   - URL: `http://localhost:5173/superadmin/login`
   - Email: `admin@lifodial.com`
   - Password: `lifodial2026`
2. **Create Test Clinic**:
   - Go to **"All Clinics"**.
   - Click **"Add Clinic"** → Fill form → Submit.
   - **COPY THE GENERATED PASSWORD** (only shown once).
3. **Login as Clinic**:
   - Logout from Super Admin.
   - Login at `http://localhost:5173/login` using generated email and password.
4. **Voice Test (Needs LiveKit Keys)**:
   - Add `LIVEKIT_*` keys to `.env`.
   - Run: `python backend/tests/create_test_room.py`

## 🚀 Vercel Deployment (Frontend)
1. `cd frontend`
2. `npm run build`
3. `vercel --prod`
4. Deploy to: `lifodial.vercel.app` (or your assigned URL).
