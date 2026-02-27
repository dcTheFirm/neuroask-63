# Welcome to your Interview Practice Platform

## Project info



<!-- Improved README for NeuroAsk -->

# NeuroAsk — Interview Practice Platform

![Vite](https://img.shields.io/badge/bundler-vite-blue.svg)
![React](https://img.shields.io/badge/framework-react-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/language-typescript-3178C6.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)

NeuroAsk is a developer-friendly interview practice web app that provides both text and voice interview simulations, progress tracking, and session review. It's built with Vite, React, and TypeScript and integrates with Supabase for backend functionality.

Key goals:

- Fast local development with Vite
- Extensible UI driven by shadcn-ui and Tailwind CSS
- Optional Supabase serverless functions for backend features

## Table of contents

1. [Quick start](#quick-start)
2. [Environment variables](#environment-variables)
3. [Scripts](#scripts)
4. [Project structure](#project-structure)
5. [Deployment](#deployment)
6. [Contributing](#contributing)
7. [Troubleshooting](#troubleshooting)
8. [License & contact](#license--contact)

## Quick start

Requirements:

- Node.js 18+ (use nvm to manage versions)
- npm or pnpm

Clone and run locally:

```bash
git clone <YOUR_GIT_URL>
cd neuroask-63
npm install
# copy .env.example to .env and fill values
cp .env.example .env
npm run dev
```

Open the app at http://localhost:5173 (or the port shown by Vite).

## Environment variables

Create a `.env` file at the project root. Do not commit secrets. Example entries are provided in `.env.example` (this repository includes a sample). Typical variables used:

- VITE_SUPABASE_URL — Supabase project URL
- VITE_SUPABASE_ANON_KEY — Supabase anon/public key
- VITE_GEMINI_API_KEY — API key for Gemini (if enabled)

Check `src/` and `supabase/functions/` for additional env var usage.

## Scripts

Common npm scripts in `package.json`:

- npm run dev — start Vite dev server
- npm run build — build production assets into `dist/`
- npm run preview — preview production build locally (after `build`)

If you want, I can add `start` or other helper scripts.

## Project structure

- `src/` — React application source
	- `main.tsx` — app entry
	- `App.tsx` — routes and layout
	- `components/` — pages and UI components
- `supabase/` — Supabase project files and serverless functions
- `public/` — static assets
- `package.json`, `vite.config.ts`, `tailwind.config.ts` — project config

## Deployment

Static hosting (Vercel / Netlify / Cloudflare Pages):

1. Push your repository to GitHub/GitLab.
2. Connect the repository in your hosting provider.
3. Set environment variables in the provider's dashboard.
4. Use the build command `npm run build` and publish the `dist/` directory.

Supabase functions:

- If you rely on serverless functions in `supabase/functions/`, deploy them with the Supabase CLI or dashboard.

## Contributing

1. Fork the repository and create a branch for your fix/feature.
2. Follow the existing code style (TypeScript, shadcn-ui, Tailwind).
3. Add tests where useful and update documentation.
4. Open a PR with a clear description and screenshots when relevant.

## Troubleshooting

- Dev server problems: ensure correct Node.js version, then run `rm -rf node_modules && npm install`.
- Env vars not loaded in client: make sure client-side vars are prefixed with `VITE_`.
- Build issues: run `npm run build` and check terminal errors.

## License & contact

This project is provided under the MIT license — update this if you use a different license.





