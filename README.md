# SyncSpace - Production-Ready Real-Time Messaging Platform

SyncSpace is a modern, professional full-stack messaging application built with React, Node.js, and Socket.IO. It features a unique "Focus Mode" for productivity and "Smart Summaries" for conversation clarity.

## Features

- **Real-time Messaging**: Instant message delivery using Socket.IO.
- **User Authentication**: Secure JWT-based login and signup.
- **Presence Tracking**: Real-time online/offline status indicators.
- **Typing Indicators**: Visual feedback when someone is typing.
- **Focus Mode**: 
  - Distraction-free UI with Gaussian blur and contrast reduction.
  - Live session timer.
  - Productivity statistics tracking.
  - Batched notification simulation.
- **Smart Summaries**: Automatic thread summarization every 10 messages using a local analysis algorithm.
- **Modern Dark UI**: Premium SaaS-level aesthetic with Framer Motion animations.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Zustand, Lucide React.
- **Backend**: Node.js, Express, Socket.IO, MongoDB, Mongoose.
- **Authentication**: JWT, bcryptjs.

## Setup Instructions

### Backend Setup
1. Navigate to `/backend`.
2. Install dependencies: `npm install`.
3. Create a `.env` file (see `.env.example`).
4. Start the server: `npm run dev`.

### Frontend Setup
1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Create a `.env` file (see `.env.example`).
4. Start the dev server: `npm run dev`.

## Environment Variables

### Backend (`/backend/.env`)
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

### Frontend (`/frontend/.env`)
```env
VITE_API_URL=http://localhost:5001/api
```

## Folder Structure

```
SyncSpace/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket.js
│   └── index.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── store/
│   │   └── App.jsx
│   └── tailwind.config.js
```
# SyncSpace
