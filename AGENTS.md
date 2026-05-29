# AGENTS.md

This file applies to the entire repository.

## Project

- App name: `OllaBridge`
- Stack: Next.js App Router, TypeScript, Tailwind CSS, React 19
- Product: local-first web client for chatting with a remote Ollama instance through internal Next.js proxy routes

## Core Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Tests: `npm run test`
- Production build: `npm run build`
- Connection check: `npm run test:connection -- --url http://HOST:11434`

Run `lint`, `typecheck`, and `build` after meaningful UI or app-logic changes. Run `test` when touching shared logic, validation, or connection flows.

## Architecture Rules

- Do not call Ollama directly from the browser UI.
- Keep all Ollama traffic behind the internal API routes under `app/api/ollama/*`.
- Preserve the local-first storage model:
  - connection settings, selected model, active session, and theme in `localStorage`
  - chat sessions and messages in IndexedDB via `lib/storage/db.ts`
- File parsing rules:
  - text-like files are handled client-side when possible
  - `pdf` and `docx` are parsed on the server
  - unsupported binary files should fail gracefully

## Important Files

- `components/providers/app-provider.tsx`: global app state, connection health, streaming, persistence
- `components/composer/chat-composer.tsx`: prompt input, uploads, model picker, send flow
- `app/api/ollama/chat/route.ts`: streaming proxy route
- `lib/ollama/server.ts`: upstream fetch + timeout behavior
- `app/globals.css`: design tokens and shared surface styles
- `tailwind.config.ts`: theme extensions and animation tokens

## UI Guidance

- Keep the current premium AI-product direction intact.
- Prefer layered surfaces, soft depth, restrained motion, and strong spacing rhythm.
- Light mode should feel intentional and tinted, not plain white.
- Reuse the shared visual tokens in `app/globals.css`:
  - `.panel`
  - `.panel-muted`
  - `.field`
  - `.token-pill`
  - `.micro-lift`
  - `.focus-ring`
- Avoid reverting to flat default Tailwind panels or harsh borders.

## Repo-Specific Notes

- The root `src` file is an intentional placeholder. Do not repurpose it as a source directory.
- Keep comments sparse and only where they clarify non-obvious behavior.
- Prefer extending existing reusable components before introducing one-off variants.
- When adjusting connection behavior, keep the connection badge tied to actual server reachability, not merely request activity.
