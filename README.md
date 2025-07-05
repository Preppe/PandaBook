# 🐼 Panda Audiobook

A modern, self-hosted audiobook platform built with microservices architecture, featuring real-time progress tracking, multi-provider authentication, and seamless audio streaming.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## 📖 Overview

Panda Audiobook is a comprehensive audiobook platform designed for developers who want to self-host their own audiobook service. Built with modern technologies and microservices architecture, it provides a complete solution for audiobook streaming, user management, and administrative controls.

**Perfect for:**
- Developers wanting to self-host an audiobook platform
- Organizations needing a private audiobook service
- Anyone looking for a modern, scalable audiobook solution

## 🚀 Key Features

- **🎵 Audio Streaming**: Seamless audio streaming from AWS S3 with resume capability
- **📊 Real-time Progress Tracking**: WebSocket-based progress synchronization across devices
- **🔐 Multi-Provider Authentication**: Support for Google, Facebook, Apple, and traditional email/password
- **📱 Progressive Web App**: PWA support for mobile-like experience
- **👨‍💼 Admin Dashboard**: Comprehensive administrative interface
- **🎨 Modern UI**: Responsive design with Tailwind CSS and Shadcn/UI
- **🔄 Real-time Updates**: WebSocket integration for live progress updates
- **🛡️ Security**: JWT authentication with refresh tokens and secure headers
- **📈 Scalable Architecture**: Microservices design with Redis caching

## 🛠️ Technology Stack

### Backend
- **NestJS** - Node.js framework for scalable server-side applications
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Robust relational database
- **Redis** - In-memory data store for caching and real-time features
- **Socket.IO** - Real-time bidirectional event-based communication
- **TypeORM** - Object-relational mapping
- **Bull** - Redis-based job queue
- **AWS S3** - Cloud storage for audio files and images

### Frontend
- **Next.js 14** - React framework with App Router
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Zustand** - Lightweight state management
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality component library
- **Framer Motion** - Animation library

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│    Frontend     │    │    Dashboard    │    │     Backend     │
│   (Next.js)     │    │   (Next.js)     │    │    (NestJS)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │                 │    │                 │    │                 │
    │   PostgreSQL    │    │      Redis      │    │     AWS S3      │
    │   (Database)    │    │   (Cache/Jobs)  │    │  (File Storage) │
    │                 │    │                 │    │                 │
    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Services
- **Backend**: REST API with WebSocket support
- **Frontend**: User-facing audiobook application
- **Dashboard**: Administrative interface
- **Database**: PostgreSQL for persistent data
- **Cache**: Redis for session management and real-time features
- **Storage**: AWS S3 for audio files and images

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Preppe/audiobook3.git
cd audiobook3
```

2. **Set up environment variables**
```bash
# Backend configuration
cp backend/env-example backend/.env
# Edit backend/.env with your configuration

# Frontend configuration
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your API endpoints
```

3. **Start the services**
```bash
docker-compose up -d
```

4. **Run database migrations**
```bash
cd backend
npm run migration:run
```

5. **Seed the database (optional)**
```bash
npm run seed:run
```

6. **Access the application**
- Frontend: http://localhost:3000
- Dashboard: http://localhost:3001  
- Backend API: http://localhost:3333
- API Documentation: http://localhost:3333/docs

## 🛠️ Development

### Backend Development
```bash
cd backend
npm install
npm run start:dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Dashboard Development
```bash
cd dashboard
npm install
npm run dev
```

## 📁 Project Structure

```
audiobook3/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/           # Authentication modules
│   │   ├── books/          # Book management
│   │   ├── users/          # User management
│   │   ├── progress/       # Progress tracking
│   │   ├── s3/            # File storage
│   │   └── config/        # Configuration
│   ├── test/              # E2E tests
│   └── docker-compose.yaml
├── frontend/               # User application (Next.js)
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   └── lib/          # Utilities
│   └── public/           # Static assets
├── dashboard/             # Admin dashboard (Next.js)
│   ├── app/              # Dashboard pages
│   ├── components/       # UI components
│   └── lib/             # Utilities
├── memory-bank/          # Project documentation
└── docker-compose.swarm.yml # Production deployment
```

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/.env`)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/audiobook3

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3333
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.swarm.yml up -d
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📚 API Documentation

The API documentation is automatically generated using Swagger/OpenAPI and available at:
- **Development**: http://localhost:3333/docs
- **Production**: https://your-domain.com/docs

### Key API Endpoints
- `POST /auth/email/login` - User authentication
- `GET /books` - List audiobooks
- `POST /books` - Create audiobook
- `GET /progress/:bookId` - Get reading progress
- `PUT /progress/:bookId` - Update progress
- `GET /users/me` - Get current user info

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Use conventional commits

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- UI components from [Shadcn/UI](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Deployment with [Docker](https://docker.com/)

---

<p align="center">
  Made with ❤️ by developers, for developers
</p>
