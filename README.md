# 🧠 AXI Voice Assistant

**Advanced Cybernetic Intelligence Assistant**

AXI is a powerful voice-activated AI assistant capable of natural language processing, learning from interactions, and managing tasks autonomously.

---

## 🚀 Live Demo

- **Frontend Application**: [https://siddharth971.github.io/AXI/](https://siddharth971.github.io/AXI/)
- **Backend API**: [https://axi-660w.onrender.com](https://axi-660w.onrender.com)

---

## ✨ Key Features

- **Voice Command & Control**: Speak naturally to execute commands.
- **Context Awareness**: Remembers conversation history and context.
- **Autonomous Learning**: Improves responses over time.
- **Skill System**: Expandable plugin architecture.
- **Real-time Updates**: WebSocket integration for instant feedback.

## 🛠️ Technology Stack

- **Frontend**: Angular 17+, HUD-style interface.
- **Backend**: Node.js, Express, Socket.IO.
- **AI/NLP**: Custom NLP engine, TensorFlow.js integration.
- **Deployment**: GitHub Pages (Frontend) + Render (Backend).

---

## 📚 API Documentation

The backend exposes a RESTful API for interacting with AXI programmatically.

### Base URL

`https://axi-660w.onrender.com/api`

### Core Endpoints

#### 1. Execute Command

Process a natural language command.

- **Endpoint**: `POST /command`
- **Body**: `{ "text": "What tells the weather?" }`
- **Response**: `{ "response": "It's currently 25°C and sunny." }`

#### 2. Get Skill Context

Retrieve dynamic data for the side panel (weather, time, etc.).

- **Endpoint**: `GET /skill-context`
- **Response**: JSON object with active skill items.

#### 3. Conversation History

Get the full history of interactions.

- **Endpoint**: `GET /history`

#### 4. Manage Sessions

- **List Sessions**: `GET /sessions`
- **Create Session**: `POST /sessions` (Body: `{ "title": "New Chat" }`)
- **Get Session**: `GET /sessions/:id`

#### 5. Memory & Learning

- **Get Facts**: `GET /memory`
- **Get Pending Learning**: `GET /learning`

---

## 📦 Deployment

### Frontend (GitHub Pages)

The frontend is automatically deployed via GitHub Actions on every push to `main`.

### Backend (Docker/Render)

The backend is containerized using Docker and deployed on Render.

- **Dockerfile**: Located in `server/Dockerfile`.
- **Port**: 5000.

---

### 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

**License**: MIT

---

## 🗣️ Voice Commands Guide

Here are some example commands you can try with AXI:

### 🌐 Browser Automation

- "Open a new tab"
- "Close this tab"
- "Go back to previous page"
- "Scroll down to the bottom"
- "Refresh the page"
- "Take a full page screenshot"

### 🔍 Search & Media

- "Search Google for 'latest tech news'"
- "Open YouTube and play lofi music"
- "Search Wikipedia for 'Quantum Computing'"
- "Show me images of 'cyberpunk cities'"

### 💻 System & Utility

- "Copy the current URL"
- "Switch to the next tab"
- "Enable reader mode"
- "What time is it?"

### 💬 Conversation

- "Hello, who are you?"
- "Tell me a joke"
- "Acknowledge"
