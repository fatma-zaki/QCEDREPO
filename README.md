# QCED - Qassim Chamber Employee Directory

<div align="center">
  <img src="client/public/logo.png" alt="QCED Logo" width="120" height="120">
  
  **Professional Employee Directory Management System**
  
  [![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3+-38B2AC.svg)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [User Roles & Permissions](#user-roles--permissions)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

QCED (Qassim Chamber Employee Directory) is a comprehensive, bilingual employee management system designed specifically for the Qassim Chamber of Commerce. The system provides a modern, responsive interface for managing employees, departments, schedules, and organizational communications with full Arabic and English language support.

### Key Highlights

- **🏢 Enterprise-Grade**: Built for organizational efficiency and scalability
- **🌐 Bilingual Support**: Full Arabic and English language support with RTL layout
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🔐 Role-Based Access**: Comprehensive permission system with multiple user roles
- **⚡ Real-Time Updates**: WebSocket integration for live notifications and updates
- **🎨 Modern UI/UX**: Beautiful, professional interface with Qassim Chamber branding

## ✨ Features

### 🔐 Authentication & Authorization
- **Secure Login System**: JWT-based authentication with role-based access control
- **Multi-Role Support**: Admin, HR, Manager, and Employee roles with specific permissions
- **Session Management**: Automatic token refresh and secure logout
- **Password Security**: Encrypted password storage with bcrypt

### 👥 Employee Management
- **Complete Employee Profiles**: Name, contact info, department, position, and extensions
- **Advanced Search & Filtering**: Search by name, department, extension, or role
- **Bulk Operations**: Mass employee management and data export
- **Avatar Support**: Profile picture upload and management
- **QR Code Generation**: Quick employee identification and contact sharing

### 🏢 Department Management
- **Organizational Structure**: Hierarchical department management
- **Manager Assignment**: One manager per department constraint
- **Employee Distribution**: Track employee count and department statistics
- **Organizational Codes**: Custom department identification system

### 📅 Schedule Management
- **Department Schedules**: Manager-controlled department-wide scheduling
- **Individual Shifts**: Detailed employee shift management
- **Weekly Planning**: Monday-Sunday schedule templates
- **Break Management**: Configurable break times and durations

### 💬 Communication System
- **Real-Time Messaging**: WebSocket-powered instant messaging
- **Role-Based Channels**: Separate communication channels for different roles
- **Message Notifications**: Real-time notification system
- **Audit Trail**: Complete message history and read receipts

### 📊 Analytics & Reporting
- **Dashboard Analytics**: Comprehensive statistics and charts
- **Department Distribution**: Visual representation of organizational structure
- **Employee Statistics**: Active/inactive employee tracking
- **Extension Usage**: Phone extension utilization analytics
- **Export Capabilities**: CSV, Excel, and PDF report generation

### 🔍 Audit & Logging
- **Complete Audit Trail**: Track all system actions and changes
- **User Activity Logs**: Detailed user action history
- **System Monitoring**: Performance and error logging
- **Security Logging**: Authentication and authorization events

### 🌐 Internationalization
- **Bilingual Interface**: Full Arabic and English support
- **RTL Layout Support**: Proper right-to-left text direction for Arabic
- **Cultural Adaptation**: Region-specific formatting and conventions
- **Dynamic Language Switching**: Seamless language transition

## 🛠 Tech Stack

### Frontend
- **React 18.2.0** - Modern UI library with hooks and concurrent features
- **Redux Toolkit** - State management with RTK Query for API calls
- **React Router v6** - Client-side routing and navigation
- **Tailwind CSS 3.3+** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Chart.js** - Interactive charts and data visualization
- **Vite** - Fast build tool and development server
- **PWA Support** - Progressive Web App capabilities

### Backend
- **Node.js 18+** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing and security
- **Socket.io** - Real-time bidirectional communication
- **Multer** - File upload handling
- **Winston** - Comprehensive logging system

### Development Tools
- **ESLint** - Code linting and quality assurance
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework
- **Git** - Version control system

## 📁 Project Structure

```
QCED/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   │   ├── logo.png       # Application logo
│   │   ├── manifest.json  # PWA manifest
│   │   └── sw.js         # Service worker
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   │   ├── ui/       # UI components (buttons, modals, etc.)
│   │   │   ├── layout/   # Layout components (headers, footers)
│   │   │   ├── forms/    # Form components
│   │   │   ├── Charts/   # Data visualization components
│   │   │   └── schedule/ # Schedule management components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── store/        # Redux store and slices
│   │   ├── utils/        # Utility functions
│   │   └── docs/         # Documentation
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
├── server/               # Node.js backend application
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── tests/           # Backend tests
│   ├── logs/            # Application logs
│   ├── exports/         # Generated exports
│   ├── package.json     # Backend dependencies
│   └── server.js        # Main server file
├── scripts/             # Setup and deployment scripts
└── README.md           # This file
```

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **MongoDB** (v6.0 or higher)
- **Git** (for version control)

### Optional Prerequisites
- **Redis** (for enhanced session management and caching)
- **PM2** (for production process management)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/QCED.git
cd QCED
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

Create environment files for both client and server:

```bash
# Server environment
cd server
cp config.env.example config.env
```

Edit `server/config.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/qced

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379
```

### 4. Database Setup

Start MongoDB and create the database:

```bash
# Start MongoDB (if not running as a service)
mongod

# The application will automatically create the database and collections
```

### 5. Initialize Database (Optional)

Run the database initialization script:

```bash
cd server
node scripts/initDatabase.js
```

## ⚙️ Configuration

### Frontend Configuration

The frontend uses Vite for development and building. Key configuration files:

- `client/vite.config.js` - Vite configuration with PWA support
- `client/tailwind.config.js` - Tailwind CSS configuration with custom themes
- `client/package.json` - Dependencies and scripts

### Backend Configuration

The backend uses Express.js with comprehensive middleware:

- `server/config.env` - Environment variables
- `server/config/database.js` - Database connection configuration
- `server/config/logger.js` - Logging configuration
- `server/middleware/` - Custom middleware for auth, validation, etc.

## 🎮 Usage

### Development Mode

Start both client and server in development mode:

```bash
# Terminal 1 - Start the backend server
cd server
npm run dev

# Terminal 2 - Start the frontend development server
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000

### Production Mode

Build and start the application for production:

```bash
# Build the frontend
cd client
npm run build

# Start the production server
cd ../server
npm start
```

### Default Login Credentials

The system comes with default admin credentials:

- **Email**: `admin@qassimchamber.com`
- **Password**: `admin123`

> **⚠️ Security Note**: Change the default password immediately after first login in production environments.

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/verify
```

### Employee Management

```http
GET    /api/employees          # Get all employees
POST   /api/employees          # Create new employee
GET    /api/employees/:id      # Get employee by ID
PUT    /api/employees/:id      # Update employee
DELETE /api/employees/:id      # Delete employee
GET    /api/employees/export   # Export employees data
```

### Department Management

```http
GET    /api/departments        # Get all departments
POST   /api/departments        # Create new department
GET    /api/departments/:id    # Get department by ID
PUT    /api/departments/:id    # Update department
DELETE /api/departments/:id    # Delete department
PUT    /api/departments/:id/manager  # Assign manager
```

### Schedule Management

```http
GET  /api/schedules/department/:id  # Get department schedule
POST /api/schedules                 # Create/update schedule
```

### Audit & Logging

```http
GET /api/audit           # Get audit logs
GET /api/audit/stats     # Get audit statistics
GET /api/audit/:id       # Get specific audit log
```

### Real-Time Communication

```http
GET  /api/messages       # Get messages
POST /api/messages       # Send message
POST /api/messages/read  # Mark messages as read
```

## 👥 User Roles & Permissions

### 🔑 Admin
- **Full System Access**: Complete control over all system features
- **User Management**: Create, edit, and delete all user accounts
- **Department Management**: Create and manage organizational structure
- **System Configuration**: Access to system settings and configurations
- **Audit Access**: View complete system audit logs and analytics

### 👔 HR (Human Resources)
- **Employee Management**: Create, edit, and manage employee records
- **Department Oversight**: View and manage department information
- **Reporting**: Generate HR reports and analytics
- **Employee Data**: Access to all employee information and statistics

### 👨‍💼 Manager
- **Team Management**: Manage employees within assigned department
- **Schedule Control**: Create and manage department schedules
- **Team Communication**: Send messages and announcements to team
- **Department Analytics**: View department-specific statistics

### 👤 Employee
- **Profile Management**: View and edit personal profile information
- **Schedule Viewing**: Access to personal and department schedules
- **Directory Access**: Browse employee directory and contact information
- **Communication**: Send and receive messages within the system

## 🛠 Development

### Code Style & Standards

The project follows modern JavaScript and React best practices:

- **ESLint Configuration**: Enforced code quality and consistency
- **Prettier Formatting**: Automatic code formatting
- **Component Structure**: Consistent component organization
- **Naming Conventions**: Clear and descriptive naming

### Adding New Features

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Follow Component Structure**:
   - Place UI components in `client/src/components/ui/`
   - Create page components in `client/src/pages/`
   - Add custom hooks in `client/src/hooks/`

3. **Update Documentation**:
   - Update this README if adding new features
   - Document API changes
   - Update component guide if adding UI components

### Testing

Run tests for both frontend and backend:

```bash
# Frontend tests
cd client
npm test

# Backend tests
cd server
npm test
```

### Code Quality

Ensure code quality before committing:

```bash
# Frontend linting
cd client
npm run lint

# Backend linting
cd server
npm run lint
```

## 🚀 Deployment

### Production Deployment

1. **Build the Application**:
   ```bash
   cd client
   npm run build
   ```

2. **Set Production Environment**:
   ```bash
   cd server
   export NODE_ENV=production
   ```

3. **Start Production Server**:
   ```bash
   npm start
   ```

### Docker Deployment (Optional)

Create Docker containers for easy deployment:

```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Environment Variables for Production

Ensure all production environment variables are properly set:

```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db:27017/qced
JWT_SECRET=your-production-jwt-secret
PORT=5000
```

## 🤝 Contributing

We welcome contributions to the QCED project! Please follow these guidelines:

### Contribution Process

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### Reporting Issues

When reporting issues, please include:
- Detailed description of the problem
- Steps to reproduce the issue
- Expected vs actual behavior
- Browser/OS information (for frontend issues)
- Screenshots if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Qassim Chamber of Commerce** - For the opportunity to develop this system
- **React Community** - For the excellent documentation and ecosystem
- **Tailwind CSS** - For the beautiful utility-first CSS framework
- **MongoDB** - For the flexible NoSQL database solution
- **All Contributors** - For their valuable contributions to this project

## 📞 Support

For support and questions:

- **Email**: support@qassimchamber.com
- **Documentation**: [Component Guide](client/src/docs/COMPONENT_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/your-username/QCED/issues)

---

<div align="center">
  <p>Made with ❤️ for Qassim Chamber of Commerce</p>
  <p>© 2024 QCED - Qassim Chamber Employee Directory</p>
</div>