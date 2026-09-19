# AIMST UniBot - Step-by-Step Render.com Cloud Deployment Guide

Follow these steps to deploy your AIMST UniBot to **Render.com** for **100% free, 24/7 internet hosting** so that students and admins can open it on **any laptop, PC, or smartphone** without needing `start-server.bat` or local servers.

---

## Step 1: Create a Free GitHub Repository

1. Go to [https://github.com](https://github.com) and log in (or sign up for free).
2. Click the **"+"** button at the top right -> **New repository**.
3. Set Repository Name: `aimst-unibot`
4. Set visibility to **Public** (or Private).
5. Click **Create repository**.
6. Upload your project files from your local folder (`c:\Users\User\.gemini\antigravity-ide\scratch\aimst-unibot`):
   - `frontend/` (contains index.html, styles.css, app.js, admin-portal.js, student-profiles.js, storage-service.js, pdf-generator.js, assets/)
   - `backend/` (contains server.js)
   - `database/` (contains aimst_unibot_db.json, schema.sql)
   - `NLP/` (contains chatbot-engine.js, knowledge-base.js)
   - `package.json`
   - `start-server.ps1` / `start-server.bat`

---

## Step 2: Deploy to Render.com

1. Go to [https://render.com](https://render.com) and click **Get Started for Free**.
2. Log in using your **GitHub account**.
3. In the Render Dashboard, click **New +** -> **Web Service**.
4. Select **Build and deploy from a Git repository**.
5. Connect your `aimst-unibot` GitHub repository.
6. Fill in the deployment details:
   - **Name**: `aimst-unibot` (or any name you prefer)
   - **Region**: Singapore (or closest region)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node backend/server.js` (or `npm start`)
   - **Instance Type**: `Free`
7. Click **Create Web Service**.

---

## Step 3: Access your Live Internet URL

1. Render will automatically build your application (takes about 1 to 2 minutes).
2. Once deployed, Render will display your live public URL at the top:
   👉 **`https://aimst-unibot.onrender.com`**

3. **Share this URL with Students & Admins!**
   - Works on Windows, Mac, Chromebook, iPhone, Android.
   - Accessible 24 hours a day, 7 days a week.
   - No need to run `start-server.bat` anymore!

---

## Optional: Connecting an Online Database (Supabase / Aiven / PlanetScale)

By default, the server will persist data using `aimst_unibot_db.json`. If you want a fully managed online MySQL/PostgreSQL database in the cloud:

1. Create a free database on [Supabase](https://supabase.com) or [Aiven](https://aiven.io).
2. Go to Render Dashboard -> **Environment** -> **Add Environment Variable**.
3. Key: `DATABASE_URL` | Value: `your_online_database_connection_string`
4. Render will automatically reconnect to your online cloud database!