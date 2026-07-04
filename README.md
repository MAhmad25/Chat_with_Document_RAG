# PDF Chat

<img src="https://i.ibb.co/LhnqXLtt/16-1x-shots-so.png" alt="16-1x-shots-so" border="0" />

PDF Chat is a simple web app that lets you upload one PDF and ask questions about it in plain English. It reads the PDF, breaks the text into searchable pieces, stores those pieces locally, and uses Mistral AI to answer from the uploaded document only.

The goal is straightforward: instead of scrolling through a long PDF, you can ask questions like:

- "What is this document about?"
- "Summarize the main points."
- "What does it say about pricing?"
- "List the requirements mentioned in the document."

If the answer is not in the PDF, the assistant is designed to say that the information is not present instead of guessing.

## What This Project Does

- Upload a PDF from the browser.
- Extract readable text from the PDF.
- Split the text into smaller chunks for better search.
- Store those chunks in a local Chroma vector database.
- Retrieve the most relevant chunks when you ask a question.
- Send the retrieved context to Mistral AI.
- Show the answer in a clean chat interface.
- Replace the current PDF whenever a new one is uploaded.

This is a single-user, single-document app. It is ideal for demos, personal use, learning retrieval-augmented generation, or building a starting point for a more advanced document assistant.

## Project Structure

```text
pdf_chat/
  backend/
    main.py              FastAPI API, PDF processing, retrieval, and chat logic
    requirements.txt     Python dependencies for pip users
    pyproject.toml       Python project metadata and dependencies
    .env.example         Example backend environment variables
    chroma_db/           Local Chroma database created after upload
    uploads/             Uploaded PDF files

  frontend/
    src/                 React app source code
    src/App.tsx          Main app screen
    src/api.ts           Browser-to-backend API calls
    src/components/      Chat, upload, and document UI components
    package.json         Frontend scripts and dependencies
    vite.config.ts       Vite config and local API proxy
```

## How It Works

```text
User uploads a PDF
        |
        v
FastAPI saves the file
        |
        v
PyPDFLoader extracts text
        |
        v
LangChain splits the text into chunks
        |
        v
Mistral embeddings turn chunks into searchable vectors
        |
        v
Chroma stores the vectors on disk
        |
        v
User asks a question
        |
        v
The backend retrieves the most relevant chunks
        |
        v
Mistral generates an answer using only those chunks
```

## Requirements

Install these before running the project:

- Python 3.14 or newer
- Node.js and npm
- A Mistral API key

You can create a Mistral API key from the Mistral console.

## Local Setup

You need two terminals: one for the backend and one for the frontend.

### 1. Start the Backend

From the project root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use this if `cp` is not available:

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and set your Mistral key:

```env
MISTRAL_API_KEY=your-real-mistral-api-key
```

Run the backend:

```bash
fastapi dev main.py
```

The backend should now be running at:

```text
http://127.0.0.1:8000
```

### 2. Start the Frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend should now be running at:

```text
http://127.0.0.1:5173
```

Open that URL in your browser, upload a PDF, and start asking questions.

## Environment Variables

### Backend

| Variable          | Required            | Purpose                                                            |
| ----------------- | ------------------- | ------------------------------------------------------------------ |
| `MISTRAL_API_KEY` | Yes                 | Lets the backend call Mistral for embeddings and chat answers.     |
| `CORS_ORIGINS`    | Only for deployment | Comma-separated list of frontend URLs allowed to call the backend. |

Local development already allows:

```text
http://localhost:5173
http://127.0.0.1:5173
```

For production, set `CORS_ORIGINS` to your deployed frontend URL, for example:

```env
CORS_ORIGINS=https://your-app.vercel.app
```

### Frontend

| Variable            | Required            | Purpose                                 |
| ------------------- | ------------------- | --------------------------------------- |
| `VITE_API_BASE_URL` | Only for deployment | The public URL of the deployed backend. |

For local development, you do not need `VITE_API_BASE_URL`. Vite proxies `/api` requests to `http://127.0.0.1:8000`.

For deployment, set it to your backend URL:

```env
VITE_API_BASE_URL=https://your-backend.example.com
```

Do not include a trailing slash.

## API Reference

The backend exposes these routes:

| Method   | Route           | What it does                                                                                           |
| -------- | --------------- | ------------------------------------------------------------------------------------------------------ |
| `GET`    | `/`             | Health check. Returns a simple healthy response.                                                       |
| `GET`    | `/api/status`   | Tells the frontend whether a PDF is currently loaded.                                                  |
| `POST`   | `/api/upload`   | Uploads a PDF, clears the previous PDF, indexes the new one, and returns the filename and chunk count. |
| `POST`   | `/api/chat`     | Accepts a question and returns an answer based on the uploaded PDF.                                    |
| `DELETE` | `/api/document` | Removes the current PDF and clears the local vector database.                                          |

Example chat request:

```json
{
      "question": "Summarize this PDF in five bullet points."
}
```

Example chat response:

```json
{
      "answer": "..."
}
```

## Important Behavior

### Only One PDF Is Active

Uploading a new PDF replaces the previous one. The app clears the old uploaded file and the old Chroma database before indexing the new document.

### Answers Stay Inside the PDF

The backend prompt tells the model to answer only from retrieved PDF text. If the answer is not found in the document, it should respond:

```text
This information is not present in the provided documents. Please ask a question related to the PDF.
```

### Chroma Is Stored on Disk

The vector database is stored in:

```text
backend/chroma_db/
```

The current uploaded PDF is stored in:

```text
backend/uploads/
```

These folders are runtime data. They are created and updated while the app runs.

## Deployment

The frontend and backend can be deployed separately.

### Frontend on Vercel

Use these settings:

| Setting              | Value                                        |
| -------------------- | -------------------------------------------- |
| Framework            | Vite                                         |
| Build command        | `npm run build`                              |
| Output directory     | `dist`                                       |
| Environment variable | `VITE_API_BASE_URL=https://your-backend-url` |

If this is a monorepo deployment, set the Vercel project root to:

```text
frontend
```

### Backend on Render, Railway, Fly.io, or a VPS

Use these settings:

| Setting                 | Value                                             |
| ----------------------- | ------------------------------------------------- |
| Build command           | `pip install -r requirements.txt`                 |
| Start command           | `fastapi run main.py --host 0.0.0.0 --port $PORT` |
| Required env var        | `MISTRAL_API_KEY`                                 |
| Production CORS env var | `CORS_ORIGINS=https://your-frontend-url`          |

If this is a monorepo deployment, set the backend service root to:

```text
backend
```

Use a host with persistent disk storage if you want uploaded documents and `chroma_db/` to survive restarts or redeploys. Serverless functions are not a good fit for this backend because the app needs local files and a local Chroma database.

## Developer Notes

### Backend Stack

- FastAPI for the HTTP API
- LangChain for document loading, splitting, retrieval, and prompt orchestration
- Mistral embeddings with `mistral-embed`
- Mistral chat model with `mistral-small-2506`
- Chroma for local vector storage
- PyPDFLoader and pypdf for PDF text extraction

### Frontend Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- lucide-react icons
- react-markdown with GitHub-flavored markdown support

### Retrieval Settings

The backend uses Chroma as a retriever with maximal marginal relevance:

```python
search_type="mmr"
search_kwargs={"k": 4, "fetch_k": 10, "lambda_mult": 0.5}
```

This tries to return relevant chunks while reducing duplicate context.

### Clearing and Replacing Documents

When a new PDF is uploaded, the backend:

1. Drops references to the existing vector store and retriever.
2. Clears Chroma's shared system cache.
3. Deletes the old `chroma_db/` directory.
4. Deletes old uploaded files.
5. Builds a fresh vector database from the new PDF.

The Chroma cache clear is important because Chroma can keep a connection open for the same database path. Without clearing it, deleting and recreating the same database directory can cause stale connection or readonly database errors.

## Troubleshooting

### The frontend says the backend is unreachable

Make sure the backend is running:

```bash
cd backend
fastapi dev main.py
```

Then open:

```text
http://127.0.0.1:8000
```

You should see a healthy response.

### Uploading fails

Check that:

- The file is a real PDF.
- The PDF contains extractable text.
- The backend terminal does not show a Mistral API key error.
- `MISTRAL_API_KEY` is set in `backend/.env`.

Scanned image-only PDFs may not work unless OCR is added.

### Chat answers are missing information

The app only answers from text it can extract and retrieve from the PDF. If the PDF has images, tables, scans, or unusual formatting, some information may not be available to the model.

### CORS errors after deployment

Set `CORS_ORIGINS` on the backend to your frontend URL:

```env
CORS_ORIGINS=https://your-app.vercel.app
```

Then restart or redeploy the backend.

### The uploaded document disappears after deployment

Your backend host may be using temporary storage. Use a persistent disk if you want `uploads/` and `chroma_db/` to survive redeploys.

## Limitations

- Supports one active PDF at a time.
- Built for single-user usage.
- Does not include login, accounts, or document permissions.
- Does not perform OCR on scanned PDFs.
- Uses local disk storage instead of cloud object storage.
- Uses local Chroma instead of a managed vector database.

## Good Next Improvements

- Add support for multiple PDFs.
- Add OCR for scanned documents.
- Add user accounts and private document libraries.
- Show source page numbers with each answer.
- Add streaming responses.
- Add tests for upload, retrieval, and chat endpoints.
- Move files and vectors to production-grade storage for multi-user deployments.

## Summary

PDF Chat is a clean starting point for a document question-answering app. Non-technical users get a simple upload-and-chat experience, while developers get a readable FastAPI and React codebase that demonstrates a practical retrieval-augmented generation workflow.
