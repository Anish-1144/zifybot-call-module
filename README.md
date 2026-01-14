# ZifyBot - User Management Platform

A full-stack user management platform built with Next.js (frontend) and Express.js (backend).

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (for backend)

### Installation

Install all dependencies for both frontend and backend:

```bash
npm run install:all
```

Or install individually:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd zifybot.frontend && npm install

# Install backend dependencies
cd zifybot.backend && npm install
```

### Environment Setup

1. **Backend Environment** (`zifybot.backend/.env`):

   ```
   PORT=5000
   MONGODB_URL_DEVELOPMENT=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   ```

2. **Frontend Environment** (`zifybot.frontend/.env.local`):
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   ```

### Running the Application

**Run both frontend and backend concurrently:**

```bash
npm run dev
```

This will start:

- Backend server on `http://localhost:5000`
- Frontend server on `http://localhost:3000`

**Run individually:**

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## 📜 Available Scripts

### Development

- `npm run dev` - Run both frontend and backend in development mode
- `npm run dev:frontend` - Run frontend only
- `npm run dev:backend` - Run backend only

### Build

- `npm run build` - Build both frontend and backend
- `npm run build:frontend` - Build frontend only
- `npm run build:backend` - Build backend only

### Production

- `npm run start` - Start both frontend and backend in production mode
- `npm run start:frontend` - Start frontend only
- `npm run start:backend` - Start backend only

### Utilities

- `npm run install:all` - Install dependencies for all packages
- `npm run lint` - Lint both frontend and backend
- `npm run format` - Format backend code

## 📁 Project Structure

```
zifybot/
├── zifybot.frontend/     # Next.js frontend application
├── zifybot.backend/      # Express.js backend API
├── .md/                  # Documentation files
└── package.json          # Root package.json for running both apps
```

## 🔐 Features

- User registration and authentication
- JWT-based authentication
- Role-based access control (Admin/User)
- Admin dashboard for user management
- User dashboard
- Responsive design with dark theme

## 📚 Documentation

See the `.md/` folder for detailed documentation:

- Setup instructions
- API documentation
- Troubleshooting guides

## 🛠️ Tech Stack

**Frontend:**

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Lucide React (Icons)

**Backend:**

- Express.js
- TypeScript
- MongoDB (Mongoose)
- JWT Authentication
- Bcrypt (Password hashing)

## 📝 License

ISC
# zifybot-call-module
