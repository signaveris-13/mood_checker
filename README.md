# Mood Checker

A mood tracking web application built with Next.js 14, Supabase, and Google OAuth. Track your daily mood on a 1–5 scale and visualize patterns across day, week, month, and year views.

## Prerequisites

- **Node.js** 18+ and npm
- A **Supabase** project (free tier at [supabase.com](https://supabase.com))
- A **Google OAuth** client (from [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret from Google Cloud Console |
| `NEXTAUTH_SECRET` | Random string for session encryption (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `http://localhost:3000` for local development |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key (Settings → API) |

### 3. Set up the database

Run the SQL in `supabase/setup.sql` in your Supabase project's SQL Editor (Dashboard → SQL Editor). This creates the `users` and `mood_entries` tables.

### 4. Configure Google OAuth redirect

In your Google Cloud Console OAuth client settings, add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.

## Running the app

### Development

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### Production

```bash
npm run build
npm start
```

## Usage

1. Sign in with your Google account
2. Select a mood (1–5) for the current day
3. Switch between Day, Week, Month, and Year views to see mood patterns
4. Navigate forward/backward in time using the arrow buttons
