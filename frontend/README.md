# 🔬 Lab Issue Reporting System

A full-stack 3-tier web application for college computer lab issue management.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│           PRESENTATION LAYER (Frontend)              │
│   HTML + CSS + Vanilla JS  |  Port: 3000            │
│   index.html  student.html  admin.html              │
└───────────────────┬─────────────────────────────────┘
                    │ REST API (HTTP/JSON)
┌───────────────────▼─────────────────────────────────┐
│           APPLICATION LAYER (Backend)                │
│   Node.js + Express  |  Port: 5000                  │
│   /api/auth  /api/issues  /api/admin                │
└───────────────────┬─────────────────────────────────┘
                    │ Mongoose ODM
┌───────────────────▼─────────────────────────────────┐
│               DATA LAYER (Database)                  │
│   MongoDB  |  Collections: users, issues            │
└─────────────────────────────────────────────────────┘
```

## Project Structure

```
lab-issue-system/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema (student/admin)
│   │   └── Issue.js         # Issue schema
│   ├── routes/
│   │   ├── auth.js          # POST /api/auth/signup, /login
│   │   ├── issues.js        # GET/POST /api/issues (student)
│   │   └── admin.js         # GET/PUT /api/admin/issues (admin)
│   ├── middleware/
│   │   ├── auth.js          # JWT protect + adminOnly guards
│   │   └── upload.js        # Multer image upload config
│   ├── uploads/             # Stored issue images
│   ├── server.js            # Express app entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
├── frontend/
│   ├── css/
│   │   └── main.css         # All styles
│   ├── js/
│   │   └── api.js           # API calls + auth helpers
│   ├── index.html           # Login / Signup page
│   ├── student.html         # Student dashboard
│   ├── admin.html           # Admin (HOD) dashboard
│   └── serve.js             # Simple static file server
│
└── README.md
```

---

## Prerequisites

Install before running:

- **Node.js** v16 or higher → https://nodejs.org
- **MongoDB** (choose one):
  - Local: Install MongoDB Community → https://www.mongodb.com/try/download/community
  - Cloud: Create free account at https://www.mongodb.com/atlas (recommended for beginners)

---

## Setup & Run — Step by Step

### Step 1: Clone / Download the project

```bash
# If using git
git clone <your-repo-url>
cd lab-issue-system

# Or just extract the ZIP and open the folder
```

---

### Step 2: Configure the Backend

```bash
cd backend
```

Open `backend/.env` and update:

```env
PORT=5000

# Option A: Local MongoDB (if MongoDB is installed locally)
MONGO_URI=mongodb://localhost:27017/lab_issue_system

# Option B: MongoDB Atlas (cloud) — replace with your connection string
# MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.mongodb.net/lab_issue_system

# Change this to any long random string for security
JWT_SECRET=my_super_secret_key_change_this
```

---

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

---

### Step 4: Start the Backend Server

```bash
# Development (auto-restart on file changes)
npm run dev

# OR Production
npm start
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

Test the API is running: Open http://localhost:5000 in your browser.
You should see: `{"message":"🔬 Lab Issue Reporting System API is running!"}`

---

### Step 5: Start the Frontend

Open a **new terminal tab/window**:

```bash
cd frontend
node serve.js
```

You should see:
```
🌐 Frontend running at http://localhost:3000
```

---

### Step 6: Open in Browser

Navigate to: **http://localhost:3000**

---

## Creating Your First Accounts

### Create an Admin Account
1. Click **"Sign Up"** tab on the login page
2. Toggle the role to **"Admin (HOD)"**
3. Fill in your name, email, password
4. Click **"Create Account"** → You'll be redirected to the Admin Dashboard

### Create a Student Account
1. Open the login page in a different browser or incognito window
2. Click **"Sign Up"**
3. Leave role as **"Student"**
4. Register → redirected to Student Dashboard

---

## API Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login, get JWT token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

**Signup body:**
```json
{
  "name": "John Doe",
  "email": "john@college.edu",
  "password": "secret123",
  "role": "student"
}
```

**Login response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": { "id": "...", "name": "John", "role": "student" }
}
```

---

### Student Issue Routes
All require: `Authorization: Bearer <token>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/issues` | Submit new issue (multipart/form-data) |
| GET | `/api/issues` | Get my issues |
| GET | `/api/issues/:id` | Get single issue |
| DELETE | `/api/issues/:id` | Delete pending issue |

**Submit issue (form fields):**
- `description` (required)
- `labNumber`
- `systemNumber`
- `image` (file, optional)

---

### Admin Routes
All require: `Authorization: Bearer <token>` + admin role

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/issues` | All issues (filter: ?status=Pending&lab=Lab1&search=keyboard) |
| GET | `/api/admin/issues/:id` | Single issue detail |
| PUT | `/api/admin/issues/:id` | Update status / add remarks |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | All registered students |

**Update issue body:**
```json
{
  "status": "In Progress",
  "adminRemarks": "Keyboard replacement ordered, ETA 2 days."
}
```

---

## Database Schema

### Users Collection
```js
{
  _id:       ObjectId,
  name:      String,
  email:     String (unique),
  password:  String (bcrypt hashed),
  role:      "student" | "admin",
  createdAt: Date,
  updatedAt: Date
}
```

### Issues Collection
```js
{
  _id:          ObjectId,
  student:      ObjectId (ref: User),
  description:  String,
  labNumber:    String,
  systemNumber: String,
  imageUrl:     String | null,
  status:       "Pending" | "In Progress" | "Resolved",
  adminRemarks: String,
  createdAt:    Date,
  updatedAt:    Date
}
```

---

## Features

### Student Dashboard
- ✅ Submit issues with description, lab/system number, image
- ✅ View personal issue history
- ✅ Track status updates in real-time
- ✅ View admin remarks
- ✅ Delete pending issues
- ✅ Image drag-and-drop upload

### Admin (HOD) Dashboard
- ✅ Dashboard with statistics (total, pending, in-progress, resolved)
- ✅ View all submitted issues
- ✅ Filter by status, lab, or search keywords
- ✅ Pagination for large issue lists
- ✅ Update issue status (Pending → In Progress → Resolved)
- ✅ Add admin remarks visible to students
- ✅ View registered students list

---

## Troubleshooting

**MongoDB connection error?**
- Make sure MongoDB is running: `sudo systemctl start mongod` (Linux) or start MongoDB Compass (Windows/Mac)
- Or use MongoDB Atlas cloud URL instead

**Port already in use?**
- Change `PORT=5000` in `.env` to another port (e.g. 5001)
- Update `API_BASE` in `frontend/js/api.js` accordingly

**Images not loading?**
- Make sure backend is running at `localhost:5000`
- Check that the `backend/uploads/` folder exists

**CORS errors?**
- Ensure backend is running before testing frontend
- Check browser console for the exact error

---

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | HTML5, CSS3, Vanilla JS | UI rendering |
| Backend | Node.js, Express.js | REST API server |
| Database | MongoDB + Mongoose | Data persistence |
| Auth | JWT + bcryptjs | Secure authentication |
| File Upload | Multer | Image handling |

---

*Built as a college-level full-stack project demonstrating 3-tier architecture.*
