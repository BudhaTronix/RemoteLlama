# OllaBridge

OllaBridge is a polished, local-first Next.js web app for chatting with a remote Ollama instance from your laptop. The UI feels familiar if you use ChatGPT or Claude, but all browser-to-model traffic is funneled through Next.js API routes so the frontend is not blocked by Ollama CORS behavior.

## Highlights

- First-run setup flow for remote Ollama protocol, host, and port
- Local persistence for connection settings, theme, selected model, sessions, and messages
- Responsive sidebar chat history with new, rename, delete, and export actions
- Streaming chat responses through a Next.js backend proxy
- File uploads with text extraction for `txt`, `md`, `csv`, `json`, `pdf`, and `docx`
- Image previews with heuristic multimodal model detection and manual override
- Markdown assistant rendering with code-block copy buttons
- Dark mode by default with a light-mode toggle

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- IndexedDB via `idb`
- `zod` for validation
- `react-markdown` + `remark-gfm` for assistant rendering
- `pdf-parse` and `mammoth` for document extraction
- Vitest + Testing Library for targeted tests

## Folder Structure

```text
app/
  api/
  error.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  chat/
  composer/
  files/
  markdown/
  providers/
  settings/
  shell/
  ui/
lib/
  chat/
  files/
  ollama/
  storage/
  utils/
tests/
types/
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app

```bash
npm run dev
```

Then open `http://localhost:3000`.

### 3. Connect to your remote Ollama server

On first launch, OllaBridge asks for:

- Protocol: `http` or `https`
- Host: IP, hostname, or full URL
- Port: defaults to `11434`

Use **Test Connection** to verify reachability, then **Save & Continue**.

## Remote Ollama Notes

OllaBridge assumes the machine running Next.js can reach the remote Ollama server over the network. The browser does not call Ollama directly. Instead:

1. The browser sends requests to Next.js routes like `/api/ollama/chat`
2. Next.js validates the saved host details
3. Next.js forwards the request to the remote Ollama server
4. Streaming chunks are converted back into SSE for the frontend

This means browser CORS is no longer the bottleneck, but the app server still needs:

- Network reachability to the Ollama machine
- Open firewall rules for the Ollama port
- A correct Ollama bind address on the remote host
- Any reverse proxy or TLS configuration required by your environment

## Firewall, CORS, and Networking

- Frontend CORS: avoided by design because the browser only talks to Next.js
- Server reachability: required between the Next.js process and the Ollama host
- Firewalls: allow inbound traffic to the Ollama port on the remote machine
- LAN access: ensure Ollama is bound to a non-loopback interface if you expect remote devices to reach it
- HTTPS: supported in the form, but certificate trust is still enforced by the server runtime

## File Handling

- `txt`, `md`, `csv`, `json`: read as text in the browser
- `pdf`, `docx`: uploaded to the server and parsed there
- Images: previewed locally and optionally forwarded to multimodal models
- Unsupported binaries: displayed as attached references with graceful warnings

Readable extracted text is appended to the relevant user turn as structured context before the Ollama request is sent.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run test
npm run test:connection -- --url http://YOUR-SERVER:11434
```

You can also use host/port flags:

```bash
npm run test:connection -- --host 192.168.1.42 --port 11434 --protocol http
```

## Important Files

- `app/api/ollama/chat/route.ts`: streams Ollama chat responses through Next.js
- `components/providers/app-provider.tsx`: app state, persistence, sessions, and streaming updates
- `components/composer/chat-composer.tsx`: prompt input, uploads, model switching, and shortcuts
- `lib/files/server.ts`: PDF and DOCX extraction
- `lib/ollama/payload.ts`: prompt history and attachment context mapping

## Environment Variables

Everything runs without environment variables by default. Optional overrides:

```env
OLLABRIDGE_PROXY_TIMEOUT_MS=5000
OLLABRIDGE_STREAM_TIMEOUT_MS=600000
NEXT_PUBLIC_OLLABRIDGE_MAX_FILE_MB=10
NEXT_PUBLIC_OLLABRIDGE_MAX_BATCH_MB=25
```

## Testing

Targeted tests cover:

- Connection normalization and safety
- Model normalization and multimodal heuristics
- Attachment context generation
- Connection form normalization behavior
