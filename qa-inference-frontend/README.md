# QA Inference Frontend

A modern, responsive, and accessible chat interface for **`qa-inference-service`** (Spring Boot 3.5 + Spring AI + Google AI Studio Gemma).

---

## Architecture & How It Connects to the Backend

The Spring Boot backend is **stateless**: it does not maintain session state or conversation history, and expects prompts to be pre-composed (with RAG retrieval already applied upstream).

The frontend owns:
1. **Conversation History Management:** When "Include previous messages as context" is enabled (default ON), the frontend composes the prompt sent to `POST /api/v1/chat` formatted as:
   ```text
   User: ...
   Assistant: ...
   User: <Latest Question>
   ```
   Capped at a configurable number of turns (default: 6 turns).
2. **Context + Question Grounding:** An optional collapsible **RAG Context** input above the prompt box allows passing reference documents or retrieved text. When populated, the prompt is formatted as:
   ```text
   Context:
   {context}

   Question:
   {question}
   ```
3. **Vite Dev Server Proxy & CORS:**
   By default, `VITE_API_BASE_URL` is empty string (`""`). The Vite dev server proxies `/api` and `/actuator` calls directly to `http://localhost:8080`, completely avoiding CORS issues in development.

---

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (with automatic system dark/light mode toggle)
- **Icons:** `lucide-react`
- **Markdown Rendering:** `react-markdown` + `remark-gfm` (with code blocks and one-click copy)
- **Testing:** Vitest + React Testing Library + `@testing-library/jest-dom`

---

## Prerequisites

- **Node.js:** v18+ (tested on v22)
- **qa-inference-service:** Spring Boot service running on `http://localhost:8080` (or toggle built-in **Mock API Mode** if backend is offline).

---

## Getting Started

### 1. Install Dependencies
```bash
cd qa-inference-frontend
npm install
```

### 2. Environment Variables
Create or inspect `.env` (a `.env.example` is provided):
```bash
# Empty string routes requests through the Vite dev-server proxy to http://localhost:8080
VITE_API_BASE_URL=
```
If you wish to point directly to a deployed service, set:
```bash
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Run Development Server
```bash
npm run dev
```
The application will start at **`http://localhost:5173`**.

---

## Features

- **Chat Interface:**
  - Auto-scrolling message list with user and assistant bubbles.
  - Multi-line textarea: <kbd>Enter</kbd> sends, <kbd>Shift</kbd>+<kbd>Enter</kbd> adds a new line.
  - Send button disabled when prompt is empty or while request is in flight.
  - Animated 3-dot typing indicator ("Gemma is thinking").
  - Markdown formatting: headers, bold/italics, lists, and syntax-styled code blocks.
  - Copy response and code blocks to clipboard.
  - Prompt Inspector toggle: view the exact composed string sent to the microservice.
- **Defensive Error Handling:**
  - `400 Bad Request`: Friendly inline guidance ("Please enter a valid prompt" + server details).
  - `504 Gateway Timeout`: "The model took too long to respond. Try again or shorten the prompt."
  - `502 / 503 / 500`: Helpful upstream failure alerts.
  - `Offline / Network Failures`: "Can't reach the server. Make sure qa-inference-service is running on port 8080."
  - **Retry button** directly on failed turns.
  - **Cancel button** with `AbortController` client-side timeout (default 35s, configurable).
- **Backend Health Polling:**
  - Health dot in header polls `GET /actuator/health` every 30 seconds.
  - Tooltip shows status, last check time, and manual recheck trigger.
- **Persistence & State:**
  - Entire conversation stored in `localStorage` across page refreshes.
  - "New Chat" button to clear history.
- **Settings Drawer:**
  - Toggle conversation memory ON/OFF.
  - Configure max history turns to include (1–20 turns).
  - Override API base URL.
  - Toggle Mock API Mode for standalone testing.
  - Configure client timeout in seconds.

---

## Testing

Run unit tests:
```bash
npm test
```
Or run Vitest in watch mode:
```bash
npm run test:watch
```

---

## Project Structure

```
qa-inference-frontend/
├── src/
│   ├── api/
│   │   ├── chatClient.ts      # Fetch client for POST /api/v1/chat with client timeouts
│   │   ├── health.ts          # Polling client for GET /actuator/health
│   │   └── mockService.ts     # Realistic mock generator & error simulation
│   ├── components/
│   │   ├── ChatWindow.tsx     # Centered container orchestrator
│   │   ├── Header.tsx         # Health dot, new chat, theme toggle, settings button
│   │   ├── MessageList.tsx    # Message feed & starter prompt chips
│   │   ├── MessageItem.tsx    # Markdown bubble, code copy, prompt inspector, retry
│   │   ├── ChatInput.tsx      # Multi-line textarea, keyboard handlers, cancel button
│   │   ├── ContextInput.tsx   # Collapsible RAG context accordion
│   │   ├── TypingIndicator.tsx# Animated 3-dot bouncing bubble
│   │   ├── SettingsDrawer.tsx # Context turns, API base URL override, mock toggle
│   │   └── MockBanner.tsx     # Offline / Mock notice banner
│   ├── hooks/
│   │   ├── useChat.ts         # Conversation state, localStorage sync, retry, cancel
│   │   ├── useHealth.ts       # 30s interval poller for actuator health
│   │   ├── useSettings.ts     # App settings state and persistence
│   │   └── useTheme.ts        # Dark / light / system preference manager
│   ├── types/
│   │   ├── chat.ts            # ChatMessage, ChatRequest, ChatResponse, ApiError
│   │   └── settings.ts        # AppSettings, ThemeMode
│   └── utils/
│       ├── promptBuilder.ts   # Context injection and turn history formatting
│       ├── errorParser.ts     # Defensive JSON / HTTP error parser
│       └── storage.ts         # Safe localStorage wrappers
├── vite.config.ts             # Dev proxy for /api & /actuator, Vitest configuration
├── tailwind.config.js         # Custom colors, dark mode, animations
└── package.json
```
