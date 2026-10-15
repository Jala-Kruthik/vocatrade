# 🛠️ VocaTrade — AI-Emergent Vocational Mastery & Trade-Skill Simulation Planner

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**VocaTrade** is an end-to-end vocational training, trade skill simulation, and certified service marketplace platform. It bridges the gap between apprentice training and real-world clients by combining rigorous certification testing, practical field logs, hands-on trade drills, and a secure client request marketplace.

---

## 🌟 Key Features

### 👤 1. Client Marketplace Portal (`/client`)
- **Discover Certified Providers**: Browse trade professionals categorized by trade (Plumbing, Electrical, Carpentry, Welding, HVAC, Masonry) with verified certification badges.
- **Service Requests**: Submit customized service requests with detailed descriptions, location, and urgency.
- **Live Status Tracking**: Track requests in real time across four distinct lifecycle stages:
  - 🟡 **Pending**: Awaiting provider review
  - 🟢 **Accepted**: Provider accepted; reveals direct contact information (phone & email)
  - 🔴 **Declined**: Provider unavailable
  - 🔵 **Completed**: Service rendered; enables client rating and feedback
- **Feedback & Review System**: Rate completed jobs from 1 to 5 stars with written reviews to ensure trade accountability.

### 🧰 2. Service Provider & Apprentice Portal
- **Interactive Dashboard (`/dashboard`)**:
  - Live metric tracking: Total Field Training Hours, Completed Modules, Active Drills, and Earned Certifications.
  - Client request management panel with one-click actions: **Accept**, **Decline**, and **Mark as Completed**.
- **Certification Courses (`/courses`)**:
  - Structured modular lessons covering trade fundamentals, safety procedures, and diagnostic workflows.
  - **100% Mastery Quiz Standard**: Demands 100% accuracy to earn official certification badges and unlock client marketplace listings. Instant retry with wrong answer analysis.
- **Field Logs (`/logs`)**:
  - Digital trade logbook to record on-site hours, supervisor reviews, tools used, and safety checks.
- **Practice Drills & Simulations (`/drills`)**:
  - Interactive scenario-based trade drills with step-by-step decision trees and instant score evaluation.

### 🤖 3. AI Trade Assistant
- Floating assistant widget accessible throughout the platform for instant guidance on safety regulations, diagnostic troubleshooting, and trade concepts.

---

## 🏗️ Architecture & Project Structure

```
├── backend/
│   ├── data/users/               # User records & data exports
│   ├── src/
│   │   ├── config/               # Database connection (Mongoose/MongoDB Atlas)
│   │   ├── controllers/          # Business logic (Auth, Requests, Logs, Drills, Modules)
│   │   ├── middleware/           # JWT auth verification, error handler, rate limiter
│   │   ├── models/               # Mongoose Schemas (User, ServiceRequest, Drill, FieldLog, etc.)
│   │   ├── routes/               # REST API endpoints (authRoutes, requestRoutes, dashboardRoutes, etc.)
│   │   └── server.js             # Express server entry point & custom audit logger
│   ├── .env.example              # Sample backend environment configuration
│   ├── export_users.js           # Database export utility
│   └── package.json
│
├── frontend/
│   ├── public/                   # Static assets & HTML template
│   ├── src/
│   │   ├── App.jsx               # Application routing & protected route definitions
│   │   ├── AuthContext.jsx       # Global authentication state & token management
│   │   ├── ProtectedRoute.jsx    # Role-based route authorization (client vs provider)
│   │   ├── ClientPage.jsx        # Client marketplace, request status & reviews UI
│   │   ├── DashboardPage.jsx     # Provider statistics & service request actions
│   │   ├── CoursesPage.jsx       # Vocational courses & 100% mastery quiz certification
│   │   ├── LogsPage.jsx          # Field hour logging & supervisor sign-offs
│   │   ├── DrillsPage.jsx        # Practical simulation drills
│   │   ├── ModulesPage.jsx       # Curriculum module tracker
│   │   ├── LoginPage.jsx         # User authentication page
│   │   ├── RegisterPage.jsx      # Role-based user onboarding (Client / Provider)
│   │   └── AppChatbot.jsx        # Floating trade AI assistant
│   ├── package.json
│   └── vite.config.js
│
├── diagram/                      # Architectural, UML, and database schema diagrams
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **MongoDB Atlas** database account or local MongoDB instance

---

### 1. Clone Repository
```bash
git clone https://github.com/Jala-Kruthik/vocatrade.git
cd vocatrade
```

---

### 2. Backend Setup
1. Navigate into the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your configuration:
   ```env
   PORT=5001
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/vocatrade?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ANTHROPIC_API_KEY=your_optional_anthropic_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API runs at `http://localhost:5001`.

---

### 3. Frontend Setup
1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user (`client` or `provider`) | Public |
| `POST` | `/api/auth/login` | Login and receive JWT bearer token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private |
| `GET` | `/api/dashboard` | Fetch aggregate stats (hours, drills, modules) | Provider |
| `GET` | `/api/users/providers` | Get list of certified trade providers | Client |
| `POST` | `/api/requests` | Submit new service request to a provider | Client |
| `GET` | `/api/requests/sent` | View all requests submitted by the logged-in client | Client |
| `GET` | `/api/requests/mine` | View all incoming requests for the logged-in provider | Provider |
| `PUT` | `/api/requests/:id` | Update request status (`accepted`, `declined`, `completed`) | Provider |
| `POST` | `/api/requests/:id/feedback` | Submit rating & review for completed service | Client |
| `GET` | `/api/logs` | Retrieve field training logs | Provider |
| `POST` | `/api/logs` | Log new on-site work hours and tools used | Provider |
| `GET` | `/api/drills` | List practical trade drills and simulations | Provider |
| `POST` | `/api/drills/:id/complete` | Record drill completion score | Provider |

---

## 🔒 Security & Best Practices
- **Password Hashing**: Passwords are encrypted using `bcryptjs` with salt rounds prior to persistence.
- **Stateless Authentication**: Protected routes verify signed JSON Web Tokens (`Bearer <token>`).
- **Rate Limiting**: Integrated `express-rate-limit` prevents brute-force abuse on sensitive endpoints.
- **Input Validation**: Request payloads are sanitized and validated to prevent injection vulnerabilities.

---

## 📄 License
This project is licensed under the MIT License — see the repository for full details.
