# PawHome — Puppy Adoption Platform

Full-stack adoption platform: Vite + React + Tailwind CSS frontend,
Node.js + Express backend, MongoDB Atlas, Socket.io for live chat.

## Structure

```
puppy-adoption-platform/
├── server/          Express API
│   ├── config/      DB connection (Atlas), Cloudinary
│   ├── models/      User, Shelter, Puppy, Application, Conversation, Message
│   ├── controllers/ Route logic
│   ├── routes/      Express routers
│   ├── middleware/  JWT auth, role guard, error handler, upload
│   ├── sockets/     Socket.io chat handler
│   └── server.js    Entry point
└── client/          Vite + React + Tailwind
    └── src/
        ├── api/         axios + socket.io-client instances
        ├── context/      AuthContext (global auth state)
        ├── routes/       ProtectedRoute (role-based guard)
        ├── components/   layout, puppy, chat, common
        └── pages/        Home, Browse, PuppyDetail, dashboards, chat
```

## Setup

### 1. MongoDB Atlas
Create a free cluster, add a database user, and get your connection string
from **Connect > Drivers**. Whitelist your IP (or 0.0.0.0/0 for local dev).

### 2. Server
```
cd server
npm install
cp .env.example .env   # paste your Atlas URI + a JWT secret
npm run dev
```
Runs on http://localhost:5000

### 3. Client
```
cd client
npm install
cp .env.example .env
npm run dev
```
Runs on http://localhost:5173 (Vite proxies /api to the server)

## What's already wired up

- JWT auth with 3 roles: adopter, shelter, admin
- Puppy CRUD + browse/filter/search (breed, size, gender, age, geo radius)
- Adoption applications with approve/reject/waitlist logic
- Real-time chat (Socket.io) tied to each application
- Shelter registration + admin verification flow
- Multi-tenant by default — seed one shelter and disable public shelter
  signup if you want a single-shelter deployment instead

## Not yet built (next phases)

- Cloudinary image upload wiring (model field + config are in place)
- Email notifications (nodemailer dependency installed, not called anywhere yet)
- Favorites/saved puppies, breed-match quiz, success stories, donations
- Full visual design pass (current styling is a functional placeholder)
