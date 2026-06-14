# Roof Garden — Plant Log

A static, single-page plant-care tracker (17 plants: photo, name, condition, next action),
with photo upload, per-plant editing, filtering, and a bulk "identify & route" flow.
No build step — it's one `index.html`.

## Deploy

### Option A — all in the browser (no terminal)
1. On github.com, create a new repository, e.g. `roof-garden`.
2. **Add file → Upload files** → drag in `index.html`, `vercel.json`, `README.md`, `.gitignore` → **Commit**.
3. On vercel.com: **Add New… → Project → Import** your repo → Framework preset **Other** → **Deploy**.

### Option B — terminal (git + Vercel CLI)
```bash
git init && git add . && git commit -m "Roof garden plant log"
git branch -M main
git remote add origin https://github.com/<your-username>/roof-garden.git
git push -u origin main

npm i -g vercel
vercel          # accept defaults: no build command, output directory "."
vercel --prod
```

## Important: AI features in production
The automatic plant-health analysis and bulk identification call Claude **and rely on the
Claude app's runtime** (it injects auth and provides cross-session storage). On a plain static
Vercel deploy those won't work, and the page falls back to **manual** mode:

- Photo upload, editing, filtering, and the dashboard: **work everywhere**.
- Auto re-assessment + bulk auto-identify: need a small serverless API proxy that holds an
  Anthropic API key (e.g. a Vercel function at `/api/analyze`), plus swapping the storage to
  `localStorage`. Ask and this can be added.
