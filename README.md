# PDF Chat

Upload a PDF, then ask questions about it. Backend re-indexes into Chroma on
every upload, fully replacing whatever document was loaded before.

## Architecture

- **backend/** — FastAPI. Single global "current document" state (single-user
  tool, not multi-tenant). Deploy somewhere with a persistent filesystem
  (Render, Railway, Fly.io, a VPS) — **not** Vercel serverless functions,
  because `chroma_db/` needs to survive between requests, and serverless
  functions don't guarantee that.
- **frontend/** — React + TypeScript + Vite. Deploy to Vercel. Talks to the
  backend over HTTP using `VITE_API_BASE_URL`.

## Local development

**Backend:**

```bash
cd backend
python -m venv venv && source venv/bin/activate   # or your preferred env tool
pip install -r requirements.txt
cp .env.example .env   # then fill in MISTRAL_API_KEY
fastapi dev main.py    # runs on http://127.0.0.1:8000
```

**Frontend** (separate terminal):

```bash
cd frontend
npm install
npm run dev             # runs on http://127.0.0.1:5173
```

The Vite dev server proxies `/api/*` to `http://127.0.0.1:8000` (see
`vite.config.ts`), so you don't need to set `VITE_API_BASE_URL` locally.

## Deploying

### Backend → Render (or Railway/Fly.io)

1. Push `backend/` to a GitHub repo (or connect the monorepo, root directory
   `backend`).
2. Create a new Web Service. Build command: `pip install -r requirements.txt`.
   Start command: `fastapi run main.py --host 0.0.0.0 --port $PORT`.
3. Set environment variables:
   - `MISTRAL_API_KEY` — your Mistral API key.
   - `CORS_ORIGINS` — your Vercel frontend URL once you have it, e.g.
     `https://your-app.vercel.app` (comma-separate multiple origins if needed).
4. **Important:** make sure your host gives you a persistent disk, not an
   ephemeral one that resets on every deploy/restart — otherwise `chroma_db/`
   disappears and you lose the uploaded document on every redeploy. Render's
   free tier disk is ephemeral across deploys (not across restarts of the
   same instance) — check current docs for your plan before relying on this
   for anything beyond a demo.

### Frontend → Vercel

1. Push `frontend/` to GitHub (or same monorepo, root directory `frontend`).
2. Import the project in Vercel. Framework preset: Vite.
3. Set environment variable `VITE_API_BASE_URL` to your backend's deployed
   URL (e.g. `https://your-app.onrender.com`) — no trailing slash.
4. Deploy. Build command `npm run build`, output directory `dist` (Vercel's
   Vite preset sets these automatically).

## Notes on the "replace document" behavior

Uploading a new PDF:
1. Deletes the current `chroma_db/` directory and the previously uploaded
   file.
2. Clears Chroma's internal connection cache (`SharedSystemClient.clear_system_cache()`)
   — without this step, recreating `chroma_db/` at the same path reuses a
   stale connection to the deleted database and throws "readonly database"
   errors. This was verified with an actual two-PDF upload/replace test
   during development, not just reasoned about.
3. Re-ingests the new PDF into a fresh `chroma_db/`.

The `chroma_meta.json` file just remembers the current filename across
backend restarts, so a redeployed/restarted server can pick the existing
`chroma_db/` back up instead of forgetting it was ever loaded.
