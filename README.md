🚀 SyncSpace

Secure Real-Time Engineering Collaboration MVP

SyncSpace is a production-ready, full-stack real-time collaboration platform built for internal engineering teams. It is designed to enable structured communication, reduce cognitive overload, and provide secure room-based collaboration with role-based access control.

Unlike generic chat applications, SyncSpace focuses on secure project communication, task structuring, and productivity optimization within engineering teams.

⸻

🧩 Problem Statement

Modern teams often rely on external messaging tools (e.g., WhatsApp, Slack, Teams) for internal coordination. However:
	•	Project discussions get mixed with informal communication.
	•	Sensitive conversations occur on external platforms.
	•	Teams experience constant notification-driven interruptions.
	•	There is no lightweight, structured communication system tailored for focused engineering workflows.

SyncSpace was built as an internal collaboration MVP to solve:
	•	Secure, project-based real-time communication.
	•	Role-based room isolation.
	•	Structured team allocation per project.
	•	Productivity-focused messaging with Focus Mode.
	•	Smart summarization of long discussions.

⸻

🎯 Core Objectives
	•	Build a secure real-time internal messaging system.
	•	Implement role-based room access control.
	•	Enable HR/Admin to allocate teams per project room.
	•	Reduce distraction with Focus Mode.
	•	Provide structured project discussions through smart summaries.
	•	Maintain production-ready architecture.

⸻

🏗 System Architecture

Frontend
	•	React (Vite)
	•	Tailwind CSS
	•	Framer Motion (animations)
	•	Zustand (state management)
	•	Socket.IO client

Backend
	•	Node.js
	•	Express
	•	MongoDB (Mongoose)
	•	Socket.IO
	•	JWT authentication
	•	bcrypt password hashing

Real-Time Layer
	•	Socket.IO rooms mapped to project rooms.
	•	Server-side validation for room access.
	•	Presence tracking via socket lifecycle.

⸻

🔐 Role-Based Access Control (RBAC)

SyncSpace implements a structured RBAC system:

Roles

ADMIN (HR / Project Manager)
	•	Create project rooms
	•	Delete rooms
	•	Assign team members
	•	Access all rooms
	•	Manage participants

MEMBER (Employee / Developer)
	•	View all room names (for transparency)
	•	Enter only assigned rooms
	•	Cannot delete rooms
	•	Cannot access restricted rooms

⸻

🔒 Room Access Logic

When a user attempts to join a room:
	•	If role === ADMIN → access granted.
	•	If role === MEMBER → access granted only if:
userId ∈ room.participants
	•	Otherwise → Access Restricted.

Validation is enforced server-side during:
	•	Socket.IO join_room
	•	REST API access

Frontend restrictions are only UI-level.
Security is enforced in backend.
.

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
<img width="1467" height="830" alt="Screenshot 2026-02-22 at 6 58 49 PM" src="https://github.com/user-attachments/assets/5217a7ef-d0b1-43bf-87fa-d4e1fa079b2f" />
<img width="343" height="709" alt="Screenshot 2026-02-22 at 6 43 23 PM" src="https://github.com/user-attachments/assets/557e8e2a-2412-4d12-9af7-21f11af0359d" />
<img width="271" height="568" alt="Screenshot 2026-02-22 at 7 01 30 PM" src="https://github.com/user-attachments/assets/b78bb11f-c65a-40b0-a459-4365ec5eb36a" />
<img width="339" height="705" alt="Screenshot 2026-02-22 at 6 49 51 PM" src="https://github.com/user-attachments/assets/dcf37253-ad52-4ec3-87c2-5820b3139dfb" />



