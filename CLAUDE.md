# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (eslint-config-next with core-web-vitals + typescript rules)
```

## Architecture

Next.js 16 App Router project with TypeScript, React 19, and Tailwind CSS 4. Currently in early stage — the frontend is a scaffolded `create-next-app` boilerplate awaiting feature development.

**Frontend**: `src/app/` — App Router with server components by default. Uses `next/font` for Geist font optimization and `next/image` for image optimization.

**Data pipeline** (untracked): `scripts/` contains Python scripts that classify mobile games into supergenres (Core, Casual, Casino) via the AppMagic API. `data/` holds game classification JSON/Excel files. These are local-only and not committed to git.

**Deployment**: Vercel (project already linked via `.vercel/`).

## Key Config

- **Path alias**: `@/*` maps to `./src/*` (tsconfig.json)
- **TypeScript**: Strict mode enabled
- **Tailwind CSS 4**: Configured via `@tailwindcss/postcss` plugin in `postcss.config.mjs`
- **ESLint 9**: Flat config in `eslint.config.mjs`, ignores `.next/`, `out/`, `build/`
