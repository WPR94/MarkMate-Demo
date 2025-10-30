# Deployment guide — Vercel (Vite + React)

This project uses Vite and builds to `dist/` by default. The included `vercel.json` runs `npm run build` via `@vercel/static-build` and serves the `dist` folder. It also includes a simple SPA fallback route.

Quick checklist:

- Ensure `package.json` has `build` script (it does: `vite build`).
- `vercel.json` uses `@vercel/static-build` and `dist` as output.
- For SPA routing, the route rewrites all requests to `index.html`.

Steps to push to GitHub and connect to Vercel
-------------------------------------------------

1. Create a GitHub repo (via web UI or the CLI) and add it as a remote.

   # initialize (if not a git repo yet)
   git init
   git add .
   git commit -m "chore: project import"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main

2. On Vercel:
   - Go to https://vercel.com/new
   - Import your GitHub repository (authorize Vercel to access your account if needed).
   - Vercel will usually detect this as a Vite app. If it does not, set the following manually:
     - Framework Preset: Other (or select Vite if shown)
     - Build Command: npm run build
     - Output Directory: dist
   - Set any Environment Variables required by your app (e.g., SUPABASE_URL, SUPABASE_ANON_KEY) in the Vercel project settings → Environment Variables.
   - Deploy.

3. Preview and production:
   - After import, Vercel will run a preview deployment on every branch and a production deployment for the branch you choose (typically `main`).
   - Check the Vercel dashboard for build logs if something fails.

Local build verification (optional but recommended)
-------------------------------------------------

Run locally to validate build output:

```powershell
cd <project-root>
npm ci   # optional but recommended for reproducible installs
npm run build
```

If successful, you should have a `dist/` directory that Vercel will serve.

Troubleshooting tips
--------------------
- If your site shows a 404 on internal routes, ensure `vercel.json` has the SPA fallback route.
- If assets are missing, confirm `base` or `homepage` settings (not required for most Vite setups) and that the build outputs to `dist/`.
- For CORS or API key issues, use Vercel Environment Variables and never commit secrets to the repo.

Advanced: Custom builds or server-side code
------------------------------------------
If you later add server functions, follow Vercel's Serverless Functions docs and add `api/` serverless functions or a `vercel` serverless framework setup. This `vercel.json` is intentionally minimal for a static/Vite SPA.
