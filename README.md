# Military Asset Management System

A comprehensive system for tracking military assets, transfers, and assignments across bases.

## Project Structure
- `/backend`: Node.js/Express server with MongoDB.
- `/frontend`: React/Vite application.
- `DOCUMENTATION.md`: Detailed project information, data models, and instructions.

## Quick Start

### 1. Backend
```bash
cd backend
npm install
npm start
```
*The backend will automatically seed initial data and use an in-memory database.*

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features
- **Dashboard**: Real-time stats and net movement tracking.
- **Assets**: Record new purchases and manage inventory.
- **Transfers**: Facilitate asset movement between bases.
- **Assignments**: Track asset allocation to units and expenditure logging.
- **RBAC**: Secure access for Admins, Commanders, and Logistics Officers.

## Documentation
For detailed information on API endpoints, login credentials, and tech stack, please refer to [DOCUMENTATION.md](./DOCUMENTATION.md).
