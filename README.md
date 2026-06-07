<div align="center">
  <img src="/frontend/public/screenshot-for-readme.png" alt="AUREV Chat Platform" width="100%" />
  
  <br />
  <br />

  <h1>🌊 AUREV</h1>
  <p>
    <b>Momentum Communication Platform</b>
  </p>
  <p>
    A robust, real-time messaging ecosystem engineered for performance, security, and seamless user experience.
  </p>

  <div>
    <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat-square&logo=socket.io" alt="Socket.io" />
    <img src="https://img.shields.io/badge/TailwindCSS-Styling-06B6D4?style=flat-square&logo=tailwindcss" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/Zustand-State-orange?style=flat-square" alt="Zustand" />
  </div>
</div>

---

## 📖 About The Project

**AUREV** (formerly Echo) is a full-stack, real-time communication platform designed to demonstrate modern web engineering practices. Built with a focus on **scalability**, **clean architecture**, and **responsive UI**, AUREV goes beyond a simple chat application to provide a comprehensive messaging experience. 

For technical recruiters and developers, this project showcases proficiency in:
- **Full-Stack System Design**: Decoupling frontend and backend logic while maintaining seamless data flow via RESTful APIs and WebSockets.
- **Real-Time Bidirectional Communication**: Implementing Socket.io for low-latency messaging, typing indicators, and online status tracking.
- **State Management**: Utilizing Zustand for lightweight, scalable, and predictable global state management in React.
- **Security & Media Handling**: Implementing JWT-based authentication, password hashing, rate limiting, HTML sanitization, and secure cloud storage integrations (Cloudinary) for media handling.

---

## ✨ Features

### 💬 Core Messaging Experience
- **Real-Time Communication**: Instant message delivery and event broadcasting via Socket.io.
- **Rich Media Support**: Seamlessly send text, images, voice recordings, and files.
- **Interactive Chat**: Real-time typing indicators, read receipts, and message reactions.

### 🛡️ Security & Reliability
- **Authentication**: Secure JWT-based authentication with HTTP-only cookies to prevent XSS attacks.
- **Data Protection**: Passwords hashed using `bcryptjs`; inputs sanitized using `sanitize-html`.
- **API Protection**: `express-rate-limit` prevents brute-force attacks and abuse.

### 🎨 UI & Performance
- **Fluid Animations**: Leveraging `framer-motion` for buttery-smooth micro-interactions.
- **Virtualization**: Integrated `react-virtuoso` to efficiently render thousands of messages without DOM bloat.
- **Theming**: Dynamic Light and Dark modes built with TailwindCSS.
- **Responsive Layout**: Mobile-first design adapting flawlessly to desktop environments.

---

## 🏗️ System Architecture

AUREV employs a monolithic repository containing separated frontend and backend services.

- **Frontend (Client)**: A React Single Page Application (SPA) bundled with Vite. It consumes the REST API for static operations (auth, fetching history) and establishes a persistent WebSocket connection for dynamic events.
- **Backend (Server)**: A Node.js/Express RESTful API server. It acts as the orchestrator for database operations (MongoDB) and manages the Socket.io server to emit realtime events to connected clients.
- **Storage**: MongoDB stores user metadata and message history, while Cloudinary handles binary media files, ensuring the primary database remains performant.

---

## 🛠️ Technology Stack

### Frontend 
* **Core**: React 18, Vite
* **State Management**: Zustand
* **Styling & UI**: TailwindCSS, Framer Motion, Lucide React
* **Network & Real-time**: Axios, Socket.io-Client
* **Optimization**: React Virtuoso (List virtualization)

### Backend
* **Core**: Node.js, Express.js
* **Database**: MongoDB (Mongoose ORM)
* **Real-time**: Socket.io
* **Security & Auth**: JWT, bcryptjs, Express Rate Limit, Sanitize-HTML
* **Logging & Validation**: Winston (logging), Joi (schema validation)
* **Storage**: Cloudinary

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- [Git](https://git-scm.com/)
- A [Cloudinary](https://cloudinary.com/) account for media uploads

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AUREV.git
   cd AUREV
   ```

2. **Install Root Dependencies**
   The project is structured to easily install all dependencies from the root.
   ```bash
   npm run build
   ```
   *(This script automatically installs dependencies for both `backend` and `frontend`, and builds the frontend).*

### Configuration

Create a `.env` file in the `backend/` directory by copying the example file:
```bash
cp backend/.env.example backend/.env
```

Populate the `.env` file with your credentials:
```env
# Server Configuration
PORT=5002
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/aurev-chat

# Authentication
JWT_SECRET=generate_a_strong_random_secret_key

# Cloudinary (Required for image/file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Running the Application

You can start both the frontend and backend development servers.

**Terminal 1: Start Backend**
```bash
cd backend
npm run dev
```
*The backend will run on `http://localhost:5002` (or the port specified in your .env).*

**Terminal 2: Start Frontend**
```bash
cd frontend
npm run dev
```
*The frontend will start a Vite dev server, typically on `http://localhost:5173`.*

---

## 📂 Project Structure

```text
AUREV/
├── backend/                  # Node.js REST API & WebSocket Server
│   ├── src/
│   │   ├── controllers/      # Business logic & route handlers
│   │   ├── lib/              # Socket.io configuration & shared utilities
│   │   ├── middleware/       # Auth guards, rate limiters, etc.
│   │   ├── models/           # Mongoose schemas (User, Message, etc.)
│   │   ├── routes/           # Express API route definitions
│   │   └── index.js          # Server entry point
│   └── package.json          # Backend dependencies
│
├── frontend/                 # React Client Application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # View-level components (Login, Chat, etc.)
│   │   ├── store/            # Zustand global state slices
│   │   ├── lib/              # Axios instance, Socket client logic
│   │   ├── utils/            # Helper functions
│   │   └── main.jsx          # App entry point
│   └── package.json          # Frontend dependencies
│
└── package.json              # Root package config (useful scripts)
```

---

## 🚀 Performance & Design Decisions (For Recruiters)

When building AUREV, several critical decisions were made to ensure an enterprise-grade application:
1. **Zustand over Redux**: Chosen for its minimal boilerplate and direct state manipulation capabilities, reducing cognitive load and improving render performance without React Context provider hell.
2. **Virtualization**: Chat logs can grow indefinitely. `react-virtuoso` ensures that only the visible messages are rendered in the DOM, maintaining a 60FPS scrolling experience regardless of chat length.
3. **Optimistic UI Updates**: The frontend predicts successful message delivery, instantly displaying the message to the user while silently validating with the backend to mask network latency.
4. **Security Hardening**: Implementation of `sanitize-html` to block malicious script injections through chat, alongside comprehensive rate-limiting on authentication routes to prevent brute force attacks.

---

## 🛣️ Roadmap

- [ ] **Voice/Video Calls**: WebRTC integration for peer-to-peer real-time media streams.
- [ ] **Group Channels**: Support for multi-user chat rooms with role-based access control.
- [ ] **End-to-End Encryption (E2EE)**: Implementing Signal Protocol for absolute privacy.
- [ ] **Message Search & Indexing**: Adding Redis/ElasticSearch for fast message retrieval.

---

## 🤝 Contributing

Contributions are always welcome! If you have suggestions to improve this, please fork the repo and create a pull request.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.

---

<div align="center">
  <b>Built with ❤️ for seamless communication.</b><br>
  If you found this project helpful or inspiring, please consider giving it a ⭐!
</div>