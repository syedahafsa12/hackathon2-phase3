# Deployment Guide

## 1. Push Code to GitHub

(Already attempted partially via agent. If it failed, run the following manually):

```bash
git push -u origin main
```

## 2. Deploy Backend (Hugging Face Spaces)

Hugging Face Spaces is a great way to host the Python Backend (FastAPI).

### Steps:

1.  **Create a New Space**:

    - Go to [huggingface.co/spaces](https://huggingface.co/spaces).
    - Click **Create new Space**.
    - **Name**: `todo-backend` (or similar).
    - **SDK**: Select **Docker**.
    - **Template**: `Blank`.
    - **Visibility**: Public.

2.  **Connect to GitHub**:

    - You can strictly "Sync" with GitHub, or simpler: **Directly push your code to Hugging Face**.
    - _Alternative_: Use the `Dockerfile` provided in this repo.

3.  **Setup Environment Variables**:

    - In your Space settings, go to **Settings** -> **Variables and secrets**.
    - Add:
      - `DATABASE_URL`: Your Neon DB connection string (postgres://...).
      - `SECRET_KEY`: A random string for JWT.

4.  **Important**: Because this is a Monorepo (`frontend` and `backend` in one folder), Hugging Face needs to know how to build the backend.
    - We have added a `Dockerfile` in the root that specifically builds the `backend/` folder.
    - Hugging Face will automatically find this `Dockerfile` and build it.

## 3. Deploy Frontend (Vercel)

Vercel is the best place for Next.js.

### Steps:

1.  **Import Project**:

    - Go to [vercel.com/new](https://vercel.com/new).
    - Connect your GitHub account.
    - Select the repository `hackathon2-phase2`.

2.  **Configure Project**:

    - **Root Directory**: Click "Edit" and select `frontend`. (This is crucial!).
    - **Framework Preset**: Next.js (should detect automatically).

3.  **Environment Variables**:

    - Add `NEXT_PUBLIC_API_URL`.
    - **Value**: The URL of your running Hugging Face Space (e.g., `https://huggingface.co/spaces/username/todo-backend` -> click "Embed this space" for direct URL or check the browser bar, usually `https://username-space-name.hf.space`).
    - _Note_: Ensure the backend URL has no trailing slash if your code adds it.

4.  **Deploy**:
    - Click **Deploy**.

## Troubleshooting

- **CORS Error**: If Frontend can't talk to Backend, go to `backend/app/main.py` and ensure `allow_origins` includes your Vercel domain. (Currently set to `["*"]` which is permissive and good for hackathons).
