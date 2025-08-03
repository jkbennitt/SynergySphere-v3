
# 💻 Development Setup Guide

> **Version 1.0** | **Environment Setup and Getting Started**

<details>
<summary><strong>📖 Table of Contents</strong></summary>

- [Introduction](#-introduction)
- [Prerequisites](#-prerequisites)
- [Environment Setup](#-environment-setup)
- [Installation](#-installation)
- [Development Workflow](#-development-workflow)
- [Troubleshooting](#-troubleshooting)
- [Change Log](#-change-log)

</details>

---

## 📋 Introduction

This guide provides step-by-step instructions for setting up the development environment for Synergy Sphere. Follow these instructions to get your local development environment running.

---

## 🔧 Prerequisites

### Required Software

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: For version control

### Development Tools (Recommended)

- **VS Code**: With TypeScript and React extensions
- **Chrome DevTools**: For debugging
- **Postman/Insomnia**: For API testing

---

## 🚀 Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd synergy-sphere
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies for both client and server components.

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="your-jwt-secret-key"

# Development
NODE_ENV="development"
PORT=5000
```

### 4. Database Setup

Initialize the database:

```bash
npm run db:generate
npm run db:migrate
```

---

## 🏃 Installation

### Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5000`

### Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate database schema |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open database studio |

---

## 🔄 Development Workflow

### Daily Development

1. **Pull latest changes**:
   ```bash
   git pull origin main
   ```

2. **Install any new dependencies**:
   ```bash
   npm install
   ```

3. **Run migrations** (if database changes):
   ```bash
   npm run db:migrate
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

### Code Structure

```
project-root/
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom hooks
│   │   └── lib/        # Utilities and configs
│   └── index.html
├── server/             # Backend Express application
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   └── storage.ts      # Database operations
├── shared/             # Shared TypeScript types
└── docs/               # Documentation
```

### Development Guidelines

- **TypeScript**: Use strict typing throughout
- **Components**: Create reusable, well-documented components
- **Styling**: Use Tailwind CSS classes consistently
- **API**: Follow RESTful conventions for endpoints
- **Database**: Use Drizzle ORM for all database operations

---

## 🛠️ Troubleshooting

### Common Issues

#### Port Already in Use

If port 5000 is already in use:

```bash
# Kill process using port 5000
npx kill-port 5000

# Or use a different port
PORT=3000 npm run dev
```

#### Database Connection Issues

```bash
# Reset database
rm dev.db
npm run db:migrate
```

#### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors

```bash
# Check TypeScript configuration
npx tsc --noEmit

# Restart TypeScript language server in VS Code
Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

### Getting Help

1. **Check the logs**: Development server logs show detailed error information
2. **Browser DevTools**: Use Console and Network tabs for debugging
3. **Database Studio**: Use `npm run db:studio` to inspect database state
4. **Documentation**: Refer to component and API documentation

---

## 📝 Change Log

| **Version** | **Date** | **Changes** |
|-------------|----------|-------------|
| **1.0** | 2025-01-27 | Initial setup guide |

---

> **Status**: Active and maintained

*Last updated: 2025-01-27*
