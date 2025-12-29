# Ghumoyaar — AI Travel Planner

Professional, modern web application for AI-assisted travel planning focused on Indian destinations.

---

## Overview

Ghumoyaar helps users discover, plan, and export itineraries using AI-driven suggestions and interactive maps. The project combines a fast frontend with a lightweight backend and integrates third‑party APIs (Google Maps, OpenAI) for geocoding, place details, and natural language itinerary generation.

This repository contains the frontend (Vite + React + TypeScript + Tailwind) and serverless functions/integrations (Supabase / server functions) used by the application.

---

## Key Features

- AI-powered itinerary generation
- Interactive maps and place details (Google Maps)
- Trip sharing and export features
- Expense tracker and trip assistant utilities
- Responsive, accessible UI with animations

---

## Tech & Tools Used

- Frontend: React, TypeScript, Vite
- Styling: Tailwind CSS, PostCSS
- Animations: Framer Motion
- Icons: lucide-react
- UI primitives: custom components under `src/components/ui`
- Backend/DB & Auth: Supabase (serverless functions in `supabase/functions`)
- APIs: Google Maps API, OpenAI API
- Bundler: Vite (plugin: @vitejs/plugin-react-swc)
- Linting/Formatting: ESLint, Prettier (project config files present)
- Testing (optional/helpful): Vitest (if added)

---

## Repo Structure (high level)

.
├── src/                    # Application source code
│   ├── components/         # UI components & sections
│   ├── hooks/              # Custom hooks
│   ├── integrations/       # API & service integrations
│   └── pages/              # Page-level components
├── supabase/               # Supabase config, functions, migrations
├── public/                 # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md


---

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Create environment variables (see `.env.example` below)

3. Start dev server

```bash
npm run dev
```

4. Build for production

```bash
npm run build
```

5. Preview production build

```bash
npm run preview
```

---

## Environment Variables

Create a `.env.local` (or set the variables in your deployment) with values for the APIs and services used by the project. Do NOT commit secrets.

Example `.env.example`:

```
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=server-side-secret-key
GOOGLE_MAPS_API_KEY=your_google_maps_key
OPENAI_API_KEY=your_openai_key
NODE_ENV=development
```

Notes:
- Prefix frontend-exposed variables with `VITE_` so Vite injects them safely into the client bundle.
- Keep server-only secrets (service role keys) out of the client and use serverless functions or a backend to call privileged APIs.

---

## Deployment

Common targets: Vercel, Netlify, or your own Node server. Ensure environment variables are configured in your hosting provider and that any serverless functions (Supabase) are deployed to the correct environment.

---

## API Keys & Security

- Store API keys in environment variables — never commit them.
- Use server-side endpoints (Supabase functions or an API server) to keep sensitive keys hidden from the client.

---

## Adding Showcase Images

To include sample screenshots in this README or demo pages, create a `public/screenshots/` (or `docs/images/`) folder and add image files. Example markdown to add below in this README:

### Sample Screenshots

![Homepage screenshot](https://github.com/HarSharma16/GhumoYaar/blob/main/Screenshot%202025-12-29%20065500.png?raw=true)
![Itinerary screenshot](public/screenshots/itinerary-1.png)




---

## 📜 License & Attribution

This project is licensed under the **MIT License**.
See the [LICENSE](LICENSE) file for details.


### API & Services Attribution
- Maps & location data powered by **Google Maps & Places API**
- AI features powered by **OpenAI API**

### Disclaimer
This project is created for **educational and portfolio purposes**.
GhumoYaar is not affiliated with Google, OpenAI, or any travel service provider.

 
