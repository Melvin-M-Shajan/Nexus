# Nexus — AI Engineer Roadmap

An offline-first personal mission control for AI engineering study, interview preparation, project planning, and progress tracking.

[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e.svg)](LICENSE)

## Highlights

- Separate free and paid learning paths with independent browser-local progress.
- Roadmap, timeline, project ideas, interview question bank, LeetCode plan, cheat sheets, and Kanban tasks.
- Context-aware Gemini mentor using a key supplied and stored by the user.
- Offline-first persistence through Zustand and local storage.
- PWA support, responsive navigation, import/export, keyboard shortcuts, and error boundaries.

## Stack

React 19 · Vite · Zustand · React Router · Recharts · Tailwind CSS · localStorage · Gemini API

## Run locally

```bash
npm ci
npm run dev
npm run build
```

AI assistance is optional. Supply your own Gemini key through the in-app settings; no key is committed or shipped with the application.

## Privacy

Roadmap progress and tasks stay in the browser. When the optional AI mentor is used, the submitted prompt is sent directly to the configured Gemini API.

## License

MIT © 2026 Melvin M Shajan.
