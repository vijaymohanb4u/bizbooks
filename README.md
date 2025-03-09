# BizBooks - Accounting Application

BizBooks is a user-friendly accounting desktop application designed for small businesses. Built with Next.js and MySQL, it provides essential accounting features including customer/vendor management, invoicing, and financial reporting.

> **Note:** The application is currently running as a web application only. Electron desktop integration is under development and will be fully ported in a future update. Some Electron-related configurations are present in the codebase but are not currently functional.

## Prerequisites

Before running the application, ensure you have the following installed:
- Node.js (v16 or higher)
- MySQL Server (v8.0 recommended)
- npm (Node Package Manager)

## Setup Instructions

### 1. Database Setup

1. Install and start MySQL Server
2. Create a new database:
```sql
CREATE DATABASE bizbooks;
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bizbooks

# Authentication
JWT_SECRET=your_jwt_secret_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Application
NODE_ENV=development
```

Replace `your_password`, `your_jwt_secret_key`, and `your_nextauth_secret` with secure values.

### 3. Install Dependencies

```bash
npm install
```

### 4. Initialize Database

Run the database initialization script to create tables and seed initial data:

```bash
npm run init-db
```

## Running the Application

### Development Mode

To run the application in development mode with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Mode

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

The application will be available at `http://localhost:3000`

## Features

- Customer and Vendor Management
- Invoice Generation and Tracking
- Financial Reports
  - Balance Sheet
  - Income Statement
  - Profit & Loss
- Transaction Management
- User Authentication and Authorization

## Project Structure

```
bizbooks/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # Reusable React components
│   ├── lib/             # Utility functions and database connection
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── db/                  # Database initialization scripts
└── ...configuration files
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure MySQL is running
   - Verify database credentials in `.env`
   - Check if database and tables exist

2. **Build Errors**
   - Clear `.next` directory: `rm -rf .next`
   - Delete `node_modules` and reinstall: `npm install`

3. **Runtime Errors**
   - Check console for error messages
   - Verify all environment variables are set
   - Ensure MySQL connection is stable

## Development Guidelines

- Use TypeScript for type safety
- Follow the existing project structure
- Implement proper error handling
- Write clean, maintainable code
- Use Tailwind CSS for styling

## Security Considerations

- Never commit `.env` file
- Use secure values for JWT and NextAuth secrets
- Implement proper input validation
- Follow security best practices for MySQL

## License

This project is private and confidential. All rights reserved.
