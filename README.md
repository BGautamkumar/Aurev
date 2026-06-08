-
<div align="center">

<sup>
  <strong>⚡ &nbsp; F U L L - S T A C K &nbsp; · &nbsp; R E A L - T I M E &nbsp; · &nbsp; S E C U R I T Y - F I R S T &nbsp; · &nbsp; P R O D U C T I O N - G R A D E</strong>
</sup>

<br />
<br />

<h1>
  &nbsp;A &nbsp;·&nbsp; U &nbsp;·&nbsp; R &nbsp;·&nbsp; E &nbsp;·&nbsp; V&nbsp;
</h1>

<h3>
  <em>Communication engineered to move at the speed of thought.</em>
</h3>

<br />

<p>
  Most chat applications are built to <em>function.</em><br />
  <strong>AUREV was built to make engineers pause and ask — <em>"how did they build that?"</em></strong><br />
  <br />
  A production-grade, full-stack real-time messaging platform that goes far beyond the tutorial.<br />
  Every architectural decision — from WebSocket orchestration to optimistic UI rendering —<br />
  was made with a single goal: an experience so fluid, it <strong>earns trust before a user types a word.</strong>
</p>

<br />

<p>
  <img src="https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Node.js_%2F_Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js + Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
</p>
<p>
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Zustand-FF6B35?style=for-the-badge" alt="Zustand" />
  <img src="https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
</p>

<br />

</div>

---

## 📌 What This Project Demonstrates

> *This is not a tutorial clone. AUREV is a deliberate showcase of the decisions a thoughtful senior engineer would make — built to be read, understood, and respected.*

For **technical recruiters and engineers**, AUREV is proof of the following competencies:

| Competency | Implementation |
|:---|:---|
| **Full-Stack System Design** | Decoupled React SPA + Node/Express REST API + Socket.io real-time layer |
| **Real-Time Architecture** | Bidirectional event-driven communication with low-latency broadcast via WebSockets |
| **State Management** | Zustand for lightweight, predictable, boilerplate-free global state across the app |
| **Security Engineering** | JWT in HTTP-only cookies, bcrypt hashing, rate limiting, HTML sanitization |
| **Performance Optimization** | React Virtuoso virtualization, optimistic UI updates, Vite-optimized bundling |
| **Media Architecture** | Cloudinary for binary assets; MongoDB kept lean for structured data only |

---

## ✨ Feature Breakdown

### 💬 Real-Time Messaging Core
- **Instant delivery** via Socket.io with a clean event-driven architecture — zero polling, zero delay
- **Rich media support**: text, images, voice recordings, and file attachments in one unified flow
- **Live presence indicators**: typing signals, read receipts, and online/offline status — all real-time
- **Message reactions** for expressive, human-centered interaction

### 🛡️ Security & Trust Layer
- **JWT in HTTP-only cookies** — authentication tokens are fully inaccessible to client-side scripts, closing the XSS attack surface by design
- **Password security** via `bcryptjs` with proper salt rounds on every credential
- **Strict input sanitization** using `sanitize-html` — no unsanitized input ever touches the DOM
- **Rate limiting** on all sensitive routes with `express-rate-limit` — brute-force protection built in from day one

### 🎨 UI Engineering & Performance
- **Framer Motion** micro-interactions that feel intentional and alive — not just decorative
- **React Virtuoso** for infinite-scroll virtualization — 10,000+ messages rendered at a consistent 60 FPS
- **Optimistic UI**: messages surface instantly on send, with backend confirmation reconciled silently in the background
- **Dynamic theming**: Light and Dark mode with zero-flicker transitions, built natively into Tailwind

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT  (React SPA)                       │
│   Vite · Zustand · Socket.io-Client · Axios · React Virtuoso   │
└─────────────────────────┬───────────────────────────────────────┘
                          │  REST API  (HTTPS)
                          │  WebSocket (WSS)
┌─────────────────────────▼───────────────────────────────────────┐
│                    SERVER  (Node.js / Express)                   │
│    Socket.io · JWT Middleware · Rate Limiter · Joi Validation   │
└────────────────┬────────────────────────────┬───────────────────┘
                 │                            │
┌────────────────▼──────────────┐  ┌──────────▼──────────────────┐
│      MongoDB  (Mongoose)      │  │    Cloudinary  (CDN/Media)  │
│  Users · Messages · Metadata │  │  Images · Audio · Files     │
└───────────────────────────────┘  └─────────────────────────────┘
```

**Frontend** — A React SPA that consumes REST endpoints for static operations (authentication, message history retrieval) and maintains a persistent WebSocket connection for all real-time events. Bundled with Vite for fast local development and optimized production output.

**Backend** — A Node.js/Express server acting as the system's central orchestrator: handling REST routing, managing the Socket.io broadcast layer, and enforcing every layer of security middleware before data ever reaches the database.

**Storage Strategy** — MongoDB stores structured data (user profiles, message metadata, relationship graphs). Cloudinary handles all binary and media assets with global CDN delivery. The separation keeps MongoDB lean, queries fast, and the architecture clean.

---

## 🛠️ Technology Stack

### Frontend

| Tool | Role |
|:---|:---|
| React 18 + Vite | Core UI framework and lightning-fast build tooling |
| Zustand | Global state — minimal API, zero boilerplate, maximum clarity |
| TailwindCSS | Utility-first styling with built-in dark mode and theming |
| Framer Motion | Declarative animations and purposeful micro-interactions |
| Socket.io-Client | WebSocket integration with automatic reconnection handling |
| React Virtuoso | DOM virtualization for arbitrarily long message lists |
| Axios | HTTP client with request/response interceptor support |
| Lucide React | Consistent, lightweight, tree-shakeable icon system |

### Backend

| Tool | Role |
|:---|:---|
| Node.js + Express | REST API server and Socket.io host |
| MongoDB + Mongoose | Primary database with schema validation and query optimization |
| Socket.io | Bidirectional real-time event system with room management |
| JWT + bcryptjs | Stateless auth tokens and secure password hashing |
| express-rate-limit | Brute-force and abuse prevention on sensitive routes |
| sanitize-html | XSS prevention through strict input sanitization |
| Joi | Declarative request schema validation |
| Winston | Structured, leveled server-side logging |
| Cloudinary | Cloud storage with CDN delivery for all media assets |

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are available in your environment before proceeding:

- [Node.js](https://nodejs.org/) — v18.0.0 or higher
- [MongoDB](https://www.mongodb.com/) — local instance or a free MongoDB Atlas cluster
- [Cloudinary](https://cloudinary.com/) — account required for media upload functionality (free tier works)
- [Git](https://git-scm.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/AUREV.git
cd AUREV

# 2. Install all dependencies and build the frontend
npm run build
```

> The root `build` script automatically installs dependencies for both `backend/` and `frontend/` and produces an optimized production build of the React app.

### Environment Configuration

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and populate with your credentials:

```env
# ── Server ────────────────────────────────────────────────────
PORT=5002
NODE_ENV=development

# ── Database ──────────────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/aurev-chat

# ── Authentication ────────────────────────────────────────────
JWT_SECRET=replace_with_a_long_random_secret_string

# ── Cloudinary (Required for media uploads) ───────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Running Locally

```bash
# Terminal 1 — Backend API & WebSocket Server
cd backend && npm run dev
# Server running at → http://localhost:5002

# Terminal 2 — Frontend Development Server
cd frontend && npm run dev
# Client running at → http://localhost:5173
```

---

## 📂 Project Structure

```
AUREV/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route handlers and business logic
│   │   ├── lib/              # Socket.io configuration and shared utilities
│   │   ├── middleware/       # Auth guards, rate limiters, input validators
│   │   ├── models/           # Mongoose schemas: User, Message, etc.
│   │   ├── routes/           # Express API route definitions
│   │   └── index.js          # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable, composable UI components
│   │   ├── pages/            # Route-level view components (Login, Chat…)
│   │   ├── store/            # Zustand global state slices
│   │   ├── lib/              # Axios instance, Socket.io client logic
│   │   ├── utils/            # Pure helper functions
│   │   └── main.jsx          # Application entry point
│   └── package.json
│
└── package.json              # Root config with monorepo-style scripts
```

---

## 🧠 Engineering Decisions

> *These are not arbitrary choices. Every decision below reflects a deliberate trade-off considered at design time.*

**Zustand over Redux**
Redux demands an amount of boilerplate that slows iteration without adding meaningful architectural value at this project's scale. Zustand delivers the same predictable, centralized global state with a fraction of the API surface — no action types, no reducers, no wrapping providers. The result is code that reads like what it does.

**React Virtuoso for Message Rendering**
Chat histories are unbounded. Without virtualization, a conversation with 5,000 messages creates 5,000 DOM nodes — enough to degrade any browser into single-digit FPS. React Virtuoso renders only the visible viewport of messages, maintaining smooth 60 FPS scrolling regardless of how deep the chat history runs.

**Optimistic UI Updates**
Network latency is imperceptible to users when the UI predicts success. Messages render immediately on send; backend confirmation happens silently in the background. If delivery fails, the UI reconciles with a clear error state — but the perceived speed is always instant. This is the difference between a product that feels fast and one that merely is fast.

**Cloudinary for Media, MongoDB for Data**
Storing binary blobs inside MongoDB documents is a known architectural anti-pattern — it inflates document sizes, degrades query performance, and complicates backup strategies. Cloudinary handles all binary assets with global CDN delivery; MongoDB stays lean and query-efficient by design.

**HTTP-only Cookies for JWT Storage**
Storing authentication tokens in `localStorage` exposes them to any JavaScript running on the page — a textbook XSS attack vector. HTTP-only cookies are inaccessible to client-side scripts by the browser's own security model. AUREV uses this as the default, not an afterthought.

---

## 🛣️ Roadmap

Planned features in order of development priority:

- [ ] **WebRTC Voice & Video Calls** — Peer-to-peer real-time media streams without a relay server
- [ ] **Group Channels** — Multi-user chat rooms with role-based permissions and moderation
- [ ] **End-to-End Encryption** — Signal Protocol integration for verifiable message privacy
- [ ] **Full-Text Search** — Redis/Elasticsearch-backed indexing for fast, scalable message retrieval
- [ ] **Web Push Notifications** — Offline message delivery via the Web Push API

---

## 🤝 Contributing

Contributions that improve architecture, security, or performance are welcome and encouraged.

```bash
# Standard contribution flow
git checkout -b feature/your-feature-name
git commit -m "feat: clear description of what changed and why"
git push origin feature/your-feature-name

# Then open a pull request with context on the architectural decision
```

Pull requests should include rationale alongside the implementation — the *why* matters as much as the *what*.

---

## 📄 License

**All Rights Reserved.**

This software and its associated documentation are proprietary and confidential. Use, reproduction, or distribution without explicit written permission from the author is strictly prohibited.

---

<div align="center">

<br />

<strong>AUREV</strong> — Built with precision, not just passion.

<br />

<sub>If this project impressed or inspired you, a ⭐ is the best way to say so.</sub>

<br />
<br />

</div>
