# 🎓 College Complaint Management System

A full-stack Next.js + MongoDB complaint management system built for **JUIT (Jaypee University of Information Technology)**.

## ✨ Features

- **Student**: Register, submit complaints, track status, get notifications
- **Staff**: View assigned complaints, update status, add remarks
- **Admin**: Manage users, assign complaints, manage categories, full oversight
- Role-based access control (JWT auth via cookies)
- Real-time notification polling
- Status timeline / audit history
- Pagination & filtering

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend + Backend | Next.js 14 (App Router) |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookies) |
| Styling | Tailwind CSS |
| Password | bcryptjs |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd college-complaint-system
npm install
```

### 2. Environment Setup

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/complaint-system
JWT_SECRET=your_random_secret_key_here
```

**MongoDB Atlas (free):** https://cloud.mongodb.com → Create cluster → Get connection string

### 3. Seed Database

```bash
npm run seed
```

This creates demo users and categories.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@juit.ac.in | admin123 |
| Staff | staff@juit.ac.in | staff123 |
| Student | student@juit.ac.in | student123 |

## 📁 Project Structure

```
college-complaint-system/
├── app/
│   ├── (auth)/
│   │   ├── login/page.js         # Login page
│   │   └── register/page.js      # Register page
│   ├── api/
│   │   ├── auth/                 # register, login, logout, me
│   │   ├── complaints/           # CRUD + [id]
│   │   ├── categories/           # CRUD + [id]
│   │   ├── users/                # Admin user management
│   │   └── notifications/        # List + mark-read
│   ├── dashboard/
│   │   ├── student/page.js       # Student dashboard
│   │   ├── staff/page.js         # Staff dashboard
│   │   └── admin/
│   │       ├── page.js           # Admin overview
│   │       ├── complaints/page.js # All complaints table
│   │       ├── users/page.js     # User management
│   │       └── categories/page.js # Category management
│   └── complaints/
│       ├── new/page.js           # Submit complaint
│       └── [id]/page.js          # Complaint detail + update
├── components/
│   ├── layout/Navbar.js          # Navigation + notifications
│   ├── ui/StatusBadge.js         # Status pill
│   ├── ui/StatCard.js            # Dashboard stat card
│   └── complaints/ComplaintCard.js
├── lib/
│   ├── dbConnect.js              # MongoDB connection
│   └── jwt.js                   # Token sign/verify
├── middleware/
│   └── auth.js                  # getAuthUser, withAuth
├── models/
│   ├── User.js
│   ├── Complaint.js
│   ├── Category.js
│   └── Notification.js
├── scripts/
│   └── seed.js                  # Database seeder
└── .env.local.example
```

## 🔄 Complaint Workflow

```
Student submits → PENDING
Admin assigns staff → ASSIGNED
Staff starts work → IN PROGRESS
Staff resolves → RESOLVED
Admin closes → CLOSED
```

## 🌐 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard:
- `MONGODB_URI`
- `JWT_SECRET`

## 📡 API Reference

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| POST | /api/auth/logout | Auth |
| GET | /api/auth/me | Auth |
| GET | /api/complaints | Auth (role-filtered) |
| POST | /api/complaints | Student |
| GET | /api/complaints/:id | Auth |
| PUT | /api/complaints/:id | Admin/Staff |
| DELETE | /api/complaints/:id | Student(pending)/Admin |
| GET | /api/categories | Public |
| POST | /api/categories | Admin |
| PUT | /api/categories/:id | Admin |
| DELETE | /api/categories/:id | Admin |
| GET | /api/users | Admin |
| POST | /api/users | Admin |
| PUT | /api/users/:id | Admin |
| GET | /api/notifications | Auth |
| POST | /api/notifications/mark-read | Auth |

## 👥 Team

- Shomya Vishwakarma (241030435)
- Shoaib Malik (241030426)  
- Shristi Jain (241030388)

**JUIT, Waknaghat (H.P) — 2026**
