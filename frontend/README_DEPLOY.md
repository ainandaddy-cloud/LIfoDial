# Vercel Deployment (Lifodial Frontend)

Follow these steps to deploy the frontend to Vercel with zero setup.

## 1. Prerequisites
- [Vercel CLI](https://vercel.com/docs/cli) installed.
```bash
npm i -g vercel
```

## 2. Deploy (Fastest Method)
```bash
cd frontend
vercel login
vercel --prod
```
- **Project Name:** `lifodial-frontend`
- **Location:** `.`
- **Default settings:** Yes

## 3. Configuration
- Vercel will automatically detect Vite. 
- SPA routing is handled by `vercel.json` already in the repo.
- Ensure `VITE_API_URL` is set to your backend's public URL in Vercel project settings if needed.

## 4. Troubleshooting
If routing fails on refresh:
- Confirm `vercel.json` is in the root of the `frontend` folder.
- Check that the `dist` folder is selected during build if not automatic.
