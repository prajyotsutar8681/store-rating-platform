# Store Rating Platform

A full-stack web application that allows users to discover registered stores and submit ratings from 1 to 5. The platform provides role-based functionality for System Administrators, Normal Users, and Store Owners.

The application is built using React, NestJS, PostgreSQL, Prisma ORM, and JWT-based authentication.

---

## Live Application

### Frontend

https://store-rating-platform-lake.vercel.app/

### Backend API

https://store-rating-platform-hpzy.onrender.com/

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

### Backend

- NestJS
- TypeScript
- JWT Authentication
- bcrypt
- class-validator
- class-transformer

### Database

- PostgreSQL
- Prisma ORM

### Deployment

- Vercel — Frontend
- Render — Backend
- Render PostgreSQL — Production Database

---

## Features

### Role-Based Authentication

The application uses a single login system with three roles:

- System Administrator
- Normal User
- Store Owner

Access to application functionality is controlled based on the authenticated user's role.

---

## System Administrator

Administrators can:

- View a dashboard with:
  - Total users
  - Total stores
  - Total submitted ratings
- Add normal users
- Add admin users
- Add store owners
- Add stores
- View users
- View stores
- Search and filter users
- Search stores
- Sort users and stores
- View individual user details
- View store owner information and store rating
- Log out

---

## Normal User

Normal users can:

- Register through the signup page
- Log in
- View registered stores
- Search stores by name
- Search stores by address
- View overall store ratings
- View their submitted rating
- Submit a rating from 1 to 5
- Modify their submitted rating
- Change their password
- Log out

Each user can have only one rating for a particular store. Existing ratings can be modified.

---

## Store Owner

Store owners can:

- Log in
- View their store dashboard
- View the average rating of their store
- View the total number of ratings
- View users who submitted ratings
- View rating details
- Sort rating information
- Change their password
- Log out

---

## Validation

The application implements the validation rules specified in the challenge:

| Field | Validation |
|---|---|
| Name | Minimum 20 characters |
| Name | Maximum 60 characters |
| Address | Maximum 400 characters |
| Password | 8–16 characters |
| Password | At least one uppercase letter |
| Password | At least one special character |
| Email | Standard email validation |
| Rating | Integer from 1 to 5 |

Validation is applied on the backend using NestJS validation pipes and DTOs.

---

## Sorting and Search

The application supports sorting in ascending and descending order for relevant fields.

### Administrator

Users can be sorted by:

- Name
- Email
- Address
- Role
- Created date

Stores can be sorted by:

- Name
- Email
- Address
- Rating
- Created date

### Normal User

Stores can be sorted by:

- Store name
- Address
- Rating

Stores can also be searched by:

- Store name
- Address

### Store Owner

Rating records can be sorted by:

- User name
- Email
- Address
- Rating
- Rated date

---

## Project Structure

```text
store-rating-platform/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── owner/
│   │   ├── ratings/
│   │   ├── stores/
│   │   ├── prisma/
│   │   ├── generated/
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── .env.example
│   ├── package.json
│   └── prisma7.config.ts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
│
├── .gitignore
└── README.md