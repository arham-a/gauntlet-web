# Gauntlet

**Host a competition. Crown a winner.**

Gauntlet is a platform for running competitions end to end — not just listing them. Anyone can host: set a challenge, take applications, collect submissions, score them, and publish a leaderboard.

This repository is the web client. The API lives in [gauntlet-api](https://github.com/arham-a/gauntlet-api).

---

## What it does

**For organizers**

- Create a competition with a problem statement, rulebook, and submission rules
- Make it public, or private behind a passcode with manual approval
- Set an entry price, or run it free
- Review applications (including uploaded payment slips) and accept or reject entrants
- Broadcast announcements to everyone in the competition
- Download ZIP submissions, score them, and publish the leaderboard

**For participants**

- Browse and search competitions without an account
- Filter by category, price, and public/private
- Apply to private competitions or join public ones instantly
- Read the brief, track announcements, submit a solution
- Follow your rank, points, and history from your profile

---

## Tech stack

React 19 · Vite 6 · Tailwind CSS 4 · React Router 7 · HeroUI · Framer Motion · Axios

---

## Running locally

You need the API running first — see [gauntlet-api](https://github.com/arham-a/gauntlet-api).

```bash
npm install
cp .env.example .env    # then set VITE_API_URL
npm run dev             # http://localhost:5173
```

### Environment

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the API, **no trailing slash**. `http://localhost:5000` locally. |

`VITE_API_URL` is read at **build** time, not run time. Changing it means rebuilding and redeploying — it is baked into the bundle.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the built output |
| `npm run lint` | ESLint |

---

## Deployment

Deployed on Vercel. `vercel.json` rewrites all routes to `index.html` so client-side routing works on deep links and refreshes.

Set `VITE_API_URL` in the Vercel project's environment variables before deploying — a build with the wrong value will silently point at the wrong backend.
