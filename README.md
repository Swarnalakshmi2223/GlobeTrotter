# 🌍 GlobeTrotter – MERN Travel Planning & Trip Management

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](https://www.mongodb.com/mern-stack)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-68a063.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248.svg)](https://www.mongodb.com/atlas)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

**GlobeTrotter** is a full-stack web application designed for travelers to plan, organize, manage, and track complete multi-city travel itineraries and budgets in one central place.

---

## ✨ Features

- 🔐 **Authentication & Security**:
  - Secure User Registration and Login using JWT (JSON Web Tokens).
  - Passwords hashed and salted with `bcryptjs`.
  - Protected API routes and client-side route guards.

- 🧳 **Trip Management**:
  - Create trips with custom titles, descriptions, dates, and budget goals.
  - Personalized Dashboard displaying upcoming trips, trip statistics, and quick actions.
  - Full CRUD functionality (Create, Read, Update, Delete) for trips.

- 🏙️ **Multi-City Destinations**:
  - Add multiple stops/cities to any trip with distinct arrival and departure dates.
  - Automatically calculate stays and sequence your journey.

- 🎟️ **Activity & Expense Tracking**:
  - Add activities to individual destinations with date, time, notes, and individual costs.
  - Categorize activities (Sightseeing, Food & Dining, Adventure, Transportation, Accommodation, etc.).

- 📊 **Real-Time Budget Tracking**:
  - Dynamic visual budget progress bar.
  - Live calculation of **Total Budget**, **Total Spent**, and **Remaining Balance**.
  - Status alerts (**On Track**, **Approaching Limit**, **Over Budget**).

- 🗓️ **Chronological Itinerary**:
  - Interactive timeline view organizing all stops and scheduled activities chronologically.

- 👤 **User Profile & Settings**:
  - Manage account details and view travel statistics.

- 🎨 **Modern Glassmorphic UI**:
  - Sleek design system with dark mode glassmorphism accents.
  - Toast notifications powered by `react-hot-toast`.
  - Accessible modals and responsive layouts for mobile, tablet, and desktop.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: Vanilla CSS (Custom design tokens, glassmorphism, responsive grid/flexbox)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Cloud DB) with [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: `jsonwebtoken` & `bcryptjs`
- **Cross-Origin**: `cors`

---

## 📂 Project Structure

```text
GlobeTrotter/
├── client/                      # React Frontend
│   ├── public/                  # Static assets & icons
│   ├── src/
│   │   ├── api/                 # Axios client and API service methods
│   │   ├── components/          # Reusable UI components (Navbar, BudgetBar, ConfirmDialog, etc.)
│   │   ├── context/             # React Context (AuthContext)
│   │   ├── pages/               # Application views (Dashboard, TripDetail, Login, Signup, etc.)
│   │   ├── App.jsx              # Main app component & route definitions
│   │   ├── index.css            # Global design tokens and styles
│   │   └── main.jsx             # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Express Backend
│   ├── config/
│   │   └── db.js                # MongoDB connection handler
│   ├── controllers/             # Business logic (auth, trips, cities, activities, profile)
│   ├── middleware/              # Auth & error handling middlewares
│   ├── models/                  # Mongoose Schemas (User, Trip, City, Activity)
│   ├── routes/                  # Express API route endpoints
│   ├── .env.example             # Template for server environment variables
│   ├── package.json
│   └── server.js                # Server entry point
│
├── .gitignore                   # Ignored files (node_modules, .env, dist, etc.)
├── package.json                 # Root script runner (concurrent dev start)
└── README.md                    # Project documentation
```

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user | Public |
| `POST` | `/api/auth/login` | Login user & return JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user details | Private |

### Profile (`/api/profile`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Get current user profile & stats | Private |
| `PUT` | `/api/profile` | Update profile information | Private |

### Trips (`/api/trips`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trips` | Get all trips for the logged-in user | Private |
| `POST` | `/api/trips` | Create a new trip | Private |
| `GET` | `/api/trips/:id` | Get single trip with cities & activities | Private |
| `PUT` | `/api/trips/:id` | Update a trip | Private |
| `DELETE` | `/api/trips/:id` | Delete a trip and all its associated data | Private |

### Cities & Destinations (`/api/cities`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/trips/:tripId/cities` | Add a destination city to a trip | Private |
| `PUT` | `/api/cities/:id` | Update destination details | Private |
| `DELETE` | `/api/cities/:id` | Remove a city and its activities | Private |

### Activities & Expenses (`/api/activities`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/cities/:cityId/activities`| Add an activity to a destination | Private |
| `PUT` | `/api/activities/:id` | Update activity details/cost | Private |
| `DELETE` | `/api/activities/:id` | Delete an activity | Private |

---

## 🚀 Getting Started

Follow these steps to set up GlobeTrotter locally on your machine.

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (comes with Node.js)
- A **MongoDB Atlas** cluster account (or local MongoDB instance)

### 2. Clone the Repository
```bash
git clone https://github.com/<your-username>/GlobeTrotter.git
cd GlobeTrotter
```

### 3. Install Dependencies
Install dependencies for both the backend and the frontend:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root
cd ..
```

### 4. Configure Environment Variables
Inside the `server/` directory, create a `.env` file based on `.env.example`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

> ⚠️ **Important:** Never commit your `.env` file to GitHub or public repositories. It is included in `.gitignore` by default.

### 5. Run the Application

You can start both backend and frontend servers from the root folder:

```bash
# Run both server (port 5000) and client (port 5173/5174)
npm run dev
```

Or run them individually in separate terminals:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```
*Backend runs on: `http://localhost:5000`*

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
*Frontend runs on: `http://localhost:5173` (or `http://localhost:5174`)*

---

## 🛡️ Security Best Practices
- **No Hardcoded Secrets**: Secrets and database credentials are read exclusively from environment variables.
- **Data Validation & Sanitization**: Validates all client inputs before database insertion.
- **Authorization Verification**: Middleware guarantees users can only view, edit, or delete their own trips and activities.

---

## 📄 License
This project is open-source and licensed under the **ISC License**.
