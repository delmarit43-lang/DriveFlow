# DriveFlow

### Modern Full-Stack Car Rental Management System

DriveFlow is a modern, full-stack car rental management platform designed to simplify vehicle management, customer management, bookings, payments, and rental operations through a centralized digital system.

Built with a modern TypeScript-based stack, DriveFlow combines a responsive React frontend with a structured Node.js backend, Prisma ORM, and PostgreSQL database.

---

## Overview

Managing a car rental business often involves multiple disconnected processes, including vehicle availability, customer records, reservations, payments, rental status, and administrative operations.

**DriveFlow brings these workflows together into one centralized platform.**

The goal is to provide rental businesses with a reliable system for managing their daily operations while providing customers with a modern booking experience.

---

## Key Features

### Vehicle Management

* Add and manage vehicles
* Vehicle categories
* Vehicle availability tracking
* Vehicle status management
* Rental pricing
* Vehicle information management

### Booking Management

* Create reservations
* Track booking status
* Manage rental periods
* Vehicle availability validation
* Booking lifecycle management
* Reservation history

### Customer Management

* Customer profiles
* Customer information
* Rental history
* Customer management dashboard

### Authentication & Authorization

* Secure user authentication
* JWT-based authentication
* Protected routes
* Role-based access control
* Admin authorization
* Secure password handling

### Dashboard

* Rental overview
* Vehicle statistics
* Booking statistics
* Customer information
* Operational insights
* Administrative controls

### Backend API

* RESTful API architecture
* Structured API endpoints
* Request validation
* Authentication middleware
* Authorization middleware
* Error handling
* Database integration

---

## Tech Stack

### Frontend

<p>
  <img src="https://skillicons.dev/icons?i=react,ts,vite,tailwind,html,css" alt="Frontend Technologies" />
</p>

### Backend

<p>
  <img src="https://skillicons.dev/icons?i=nodejs,express,ts" alt="Backend Technologies" />
</p>

### Database & ORM

<p>
  <img src="https://skillicons.dev/icons?i=postgres,prisma" alt="Database Technologies" />
</p>

### DevOps & Tools

<p>
  <img src="https://skillicons.dev/icons?i=docker,git,github,postman,vercel,linux" alt="Development Tools" />
</p>

---

## Architecture

DriveFlow follows a separated frontend and backend architecture.

```text
                    DriveFlow
                       │
          ┌────────────┴────────────┐
          │                         │
      Frontend                  Backend API
          │                         │
   React + TypeScript         Node.js + Express
          │                         │
          │                    Authentication
          │                         │
          │                    Business Logic
          │                         │
          │                    API Validation
          │                         │
          └────────────┬────────────┘
                       │
                    Prisma
                       │
                       ▼
                  PostgreSQL
```

This separation allows the application to remain modular, maintainable, and easier to scale.

---

## Project Structure

```text
DriveFlow/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── ...
│
├── docker/
│
├── scripts/
│
├── .env.example
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* PostgreSQL
* Git
* Docker, optional

---

## Clone the Repository

```bash
git clone https://github.com/delmarit43-lang/DriveFlow.git

cd DriveFlow
```

---

## Install Dependencies

Install the frontend dependencies:

```bash
cd frontend
npm install
```

Install the backend dependencies:

```bash
cd ../backend
npm install
```

---

## Environment Variables

Create the required environment files based on the provided example configuration.

```bash
cp .env.example .env
```

Configure your environment variables before starting the application.

Typical configuration includes:

```env
DATABASE_URL=
JWT_SECRET=
PORT=
CORS_ORIGIN=
```

Never commit real secrets, API keys, passwords, or production credentials to GitHub.

---

## Database Setup

DriveFlow uses PostgreSQL with Prisma ORM.

Generate the Prisma client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

If the project contains seed data:

```bash
npx prisma db seed
```

---

## Run the Backend

```bash
cd backend
npm run dev
```

The backend API will start using the configured server port.

---

## Run the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Vite will provide the local development URL in your terminal.

---

## Docker

DriveFlow can also be run using Docker.

Build and start the services:

```bash
docker compose up --build
```

Stop the services:

```bash
docker compose down
```

Docker provides a consistent development and deployment environment for the application.

---

## API

DriveFlow provides a RESTful backend API for managing the application's core resources.

### Core API Areas

```text
Authentication
     │
     ├── Login
     ├── Registration
     └── Authorization
     
Vehicles
     │
     ├── Vehicle Management
     ├── Availability
     └── Pricing

Bookings
     │
     ├── Reservations
     ├── Rental Periods
     └── Booking Status

Customers
     │
     ├── Customer Profiles
     └── Rental History
```

API requests can be tested using tools such as Postman.

---

## Authentication & Security

Security is an important part of DriveFlow's architecture.

The application uses security practices such as:

* JWT authentication
* Protected API routes
* Role-based authorization
* Password hashing
* Input validation
* CORS configuration
* Environment-based secrets
* Secure middleware
* API access control

Security-related configuration should always be handled through environment variables and should never expose production secrets in source control.

---

## Development Workflow

A typical development workflow looks like:

```text
Create Feature
     ↓
Develop
     ↓
Test
     ↓
Validate API
     ↓
Update Database
     ↓
Review
     ↓
Commit
     ↓
Push
```

---

## Screenshots

Screenshots will be added here to showcase the main DriveFlow interfaces.

### Dashboard

*Add dashboard screenshot here.*

### Vehicle Management

*Add vehicle management screenshot here.*

### Booking Management

*Add booking management screenshot here.*

### Customer Management

*Add customer management screenshot here.*

---

## Roadmap

DriveFlow is continuously evolving.

### Current

* [x] Full-stack application architecture
* [x] React frontend
* [x] Node.js backend
* [x] PostgreSQL database
* [x] Prisma ORM
* [x] Authentication
* [x] Vehicle management
* [x] Booking management
* [x] Customer management
* [x] Docker support

### Planned

* [ ] Advanced analytics dashboard
* [ ] Payment integration
* [ ] Email notifications
* [ ] SMS notifications
* [ ] Customer portal
* [ ] Advanced vehicle availability
* [ ] Rental reports
* [ ] Invoice generation
* [ ] Improved role management
* [ ] Automated testing
* [ ] Production deployment improvements
* [ ] Public API documentation

---

## Contributing

Contributions are welcome.

If you would like to contribute:

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Make your changes
4. Test your changes
5. Commit your work

```bash
git commit -m "feat: add your feature"
```

6. Push the branch

```bash
git push origin feature/your-feature
```

7. Open a Pull Request

Please provide a clear description of your changes and explain the problem your contribution solves.

---

## Issues & Feature Requests

Found a bug or have an idea?

Open an issue and include:

* Clear title
* Description of the problem
* Steps to reproduce, if applicable
* Expected behavior
* Actual behavior
* Screenshots, if useful

Feature requests are also welcome.

---

## License

This project is licensed under the terms of the license included in this repository.

See the `LICENSE` file for more information.

---

## Author

### Siddiik Delmar

Full Stack & SaaS Developer focused on building modern web applications, scalable systems, SaaS platforms, and developer-focused solutions.

<p align="left">
  <a href="https://github.com/delmarit43-lang">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  <a href="https://delmar-dev.vercel.app">
    <img src="https://img.shields.io/badge/Portfolio-2563EB?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio" />
  </a>
  <a href="https://www.linkedin.com/in/siddiik-awil/">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
</p>

---

<p align="center">
  <strong>DriveFlow, simplifying car rental management through modern software.</strong>
</p>
