# Team Task Manager

A full-stack web application where teams can manage projects and tasks collaboratively.

This project was built as part of a Full-Stack Developer Assessment. The application allows Admins to create projects, assign tasks to team members, and track progress through different task stages.

Members can log in, view their assigned tasks, and update task status.

---

# Live Demo

Frontend: `Add Your Frontend URL`

Backend: `Add Your Backend URL`

---

# Demo Video

`Add Your Demo Video Link`

---

# GitHub Repository

`Add Your GitHub Repository Link`

---

# What This Project Does

This application helps teams organize work in one place.

Example workflow:

1. Admin creates a project
2. Admin adds team members
3. Admin creates tasks
4. Tasks are assigned to members
5. Members update task progress
6. Admin tracks overall progress from dashboard

---

# Main Features

## User Authentication

* Signup
* Login
* JWT Authentication
* Forgot Password using Email
* Protected Routes

## Project Management

* Create Projects
* Add Members
* Remove Members
* View Project Details

## Task Management

* Create Tasks
* Assign Tasks
* Update Task Status
* Delete Tasks
* Set Due Dates
* Set Priority Levels

## Dashboard

* Total Tasks
* Tasks by Status
* Overdue Tasks
* Team Progress Tracking

## Role-Based Access

### Admin

* Manage Projects
* Manage Members
* Create Tasks
* Update Any Task
* Delete Tasks

### Member

* View Assigned Tasks
* Update Assigned Task Status Only

---

# Tech Stack

## Frontend

* React.js
* React Router DOM
* Context API
* CSS

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Nodemailer

---

# Project Structure

```bash
team-task-manager/
│
├── frontend/
│
├── backend/
│
└── README.md
```

---

# Frontend Setup

## 1. Open frontend folder

```bash
cd frontend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Start frontend server

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# Backend Setup

## 1. Open backend folder

```bash
cd backend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Create `.env` file

Add the following variables:

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

EMAIL_USER=your_email

EMAIL_PASS=your_gmail_app_password

CLIENT_URL=http://localhost:5173
```

## 4. Start backend server

```bash
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

# API Endpoints

## Authentication

```bash
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password/:token
```

## Projects

```bash
GET /api/projects
POST /api/projects
POST /api/projects/:id/members
DELETE /api/projects/:id/members/:memberId
```

## Tasks

```bash
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
```

---

# Challenges I Faced

While building this project, I faced some issues such as:

* Task status update errors
* Enum mismatch issues in MongoDB
* Role-based access control bugs
* Frontend and backend API connection problems

I fixed these issues by debugging API routes, validating MongoDB schema values, and improving task update logic.

---

# What I Learned

* Building REST APIs
* JWT Authentication
* MongoDB Relationships
* Role-Based Access Control
* Full-Stack Debugging
* Railway Deployment

---

# Deployment

The project is deployed using Railway.

Frontend and backend are deployed separately and connected using environment variables.

---

# Future Improvements

* Drag and Drop Task Board
* Real-Time Notifications
* File Upload Support
* Team Chat
* Dark Mode

---

# Author

Badrinath

---

# License

This project was created for educational and assessment purposes.
