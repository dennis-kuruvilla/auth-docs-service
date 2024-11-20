# Auth-Docs Service

## Overview

This service is a **NestJS**-based backend application designed to handle key functionalities such as user authentication, user management and document management.

---

## Key Features

### Authentication APIs
- User registration, login, and logout.
- Role-based access control: supports roles like `admin`, `editor`, and `viewer`.

### User Management APIs
- **Admin-only** functionality for managing user roles and permissions.

### Document Management APIs
- Perform CRUD operations on documents.
- Upload documents for processing.

---

## Tools and Libraries

- **TypeScript**: Ensures consistent type management.
- **PostgreSQL**: Database integration.
- **JWT**: Used for user authentication and role-based authorization.
- **Docker Compose**: Facilitates containerized deployments.

---

## Prerequisites

Before running the application, ensure you have the following installed:
- **Node.js** (v18+ recommended)
- **Docker** and **Docker Compose** (if running in a containerized environment)
- **PostgreSQL** (if running without Docker)

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
For Docker
```bash
cp .env.example .env.docker
```
Without Docker 

```bash
cp .env.example .env
```
Fill in the required values, especially database credentials and AWS settings if using AWS services. The service will still start without AWS-specific values.

### 3. Running the Service
**Option 1:** Using Docker (Recommended)
Run the service, PostgreSQL, and PgAdmin using Docker Compose:
```bash
docker-compose up
```
This will start three containers:

- The Auth-Docs backend service
- A PostgreSQL instance
- PgAdmin for database management

**Option 2:** Running Locally
If you have your own PostgreSQL instance running:
```bash
npm run start:dev
```
Ensure the .env file has correct database credentials.
### 4. Run Migration
```bash
npm run typeorm migration:run -- -d src/common/datasource.ts
```
## Testing

Unit Tests
```bash
npm run test
```
End-to-End Tests
```bash
npm run test:e2e
```
Test Coverage
```bash
npm run test:cov
```
