# Vibe Work Calendar

A modern, full-stack leave management and team calendar application built with cutting-edge technologies.

## 🚀 Overview

Vibe Work Calendar is a monorepo application that helps teams manage leaves, vacations, and work-from-home days. It provides a beautiful calendar interface, team management, OAuth authentication, and real-time updates via WebSockets.

### Key Features

- 📅 **Calendar View**: Visual calendar showing all team leaves and personal time off
- 👥 **Team Management**: Create teams, invite members, manage permissions
- 🔐 **OAuth Authentication**: Sign in with Google or GitHub
- 📊 **Dashboard**: Quick stats on upcoming leaves and team activity
- 🔔 **Real-time Updates**: WebSocket support for live notifications
- 📎 **File Attachments**: Upload supporting documents (medical certificates, etc.)
- 🎨 **Beautiful UI**: Modern, responsive design with TailwindCSS
- 🐳 **Docker Ready**: Full Docker Compose setup for easy deployment

## 🏗️ Architecture

This is a **monorepo** with the following structure:

```
vibe-work-calendar/
├── apps/
│   ├── api/              # Backend (Elysia + Bun)
│   └── web/              # Frontend (React + Vite)
├── packages/
│   └── shared-types/     # Shared TypeScript types
├── docker-compose.yml    # Docker orchestration
└── package.json          # Root workspace config
```

### Tech Stack

#### Backend (`apps/api`)

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Framework**: [Elysia](https://elysiajs.com/) - TypeScript REST framework
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Storage**: MinIO (S3-compatible object storage)
- **Auth**: OAuth 2.0 (Google, GitHub) + JWT
- **WebSockets**: Real-time updates

#### Frontend (`apps/web`)

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v7
- **API Client**: Elysia Eden Treaty (type-safe)
- **Date Handling**: date-fns

#### Infrastructure

- **Database**: PostgreSQL 16
- **Storage**: MinIO
- **Containerization**: Docker + Docker Compose
- **Backups**: Automated daily backups

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **[Bun](https://bun.sh/)** v1.0+ (JavaScript runtime and package manager)
- **[Docker](https://www.docker.com/)** and **Docker Compose** (for deployment)
- **[Git](https://git-scm.com/)**

### Optional

- **PostgreSQL** (if running locally without Docker)
- **MinIO** (if running locally without Docker)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vibe-work-calendar.git
cd vibe-work-calendar
```

### 2. Install Dependencies

```bash
bun install
```

This will install dependencies for all workspaces (root, api, web, shared-types).

### 3. Environment Configuration

#### Root Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

```env
# Database
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=vibe_calendar
DB_HOST=localhost
DB_PORT=5432
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# MinIO (Object Storage)
MINIO_ENDPOINT=http://localhost:9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_BUCKET=vibe-calendar-uploads

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth - GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# JWT Secret (generate a random 32+ character string)
JWT_SECRET=your_very_long_random_secret_key_here

# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Frontend
VITE_PORT=5173
VITE_API_URL=http://localhost:3000
```

#### Setting Up OAuth

**Google OAuth:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/callback/google`
6. Copy Client ID and Secret to `.env`

**GitHub OAuth:**

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/auth/callback/github`
4. Copy Client ID and Secret to `.env`

### 4. Database Setup

#### Using Docker (Recommended)

Start PostgreSQL and MinIO:

```bash
docker-compose up -d postgres minio
```

#### Generate and Run Migrations

```bash
bun run db:generate  # Generate migration files
bun run db:migrate   # Apply migrations to database
```

## 🚀 Development

### Start Development Servers

Run both API and Web in development mode:

```bash
bun run dev
```

This will start:

- **API**: http://localhost:3000
- **Web**: http://localhost:5173
- **API Docs (Swagger)**: http://localhost:3000/swagger

### Run Individually

**API only:**

```bash
bun run dev:api
```

**Web only:**

```bash
bun run dev:web
```

### Other Useful Commands

```bash
# Type checking
bun run type-check

# Linting
bun run lint
bun run lint:fix

# Code formatting
bun run format
bun run format:check

# Database
bun run db:studio       # Open Drizzle Studio (visual DB editor)
bun run db:generate     # Generate migrations
bun run db:migrate      # Run migrations

# Testing
bun run test            # Run all tests
bun run --filter api test   # Backend tests only
bun run --filter web test   # Frontend tests only

# Clean workspace
bun run clean
```

## 🐳 Docker Deployment

### Development with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services will be available at:

- **Web**: http://localhost:8083
- **API**: http://localhost:8082
- **MinIO Console**: http://localhost:9001

### Production Deployment

1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Update `FRONTEND_URL` and `VITE_API_URL` to your domain
4. Run:

```bash
docker-compose up -d
```

### Backups

Automated backups are configured in `docker-compose.yml`:

- **Database**: Daily backups at 3 AM, kept for 7 days/4 weeks/6 months
- **MinIO**: Daily backups, stored as tar.gz

Backup locations (customize in docker-compose.yml):

- Database: `/home/user/backups/calendar/database/`
- MinIO: `/home/user/backups/calendar/minio/`

## 📁 Project Structure

### Backend (`apps/api`)

```
apps/api/
├── src/
│   ├── config/           # Configuration files
│   ├── db/              # Database schema and migrations
│   ├── middlewares/     # Auth and other middleware
│   ├── modules/         # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── leaves/      # Leave management
│   │   ├── teams/       # Team management
│   │   ├── uploads/     # File uploads
│   │   └── users/       # User management
│   ├── services/        # Shared services (WebSocket, etc.)
│   └── index.ts         # App entry point
├── drizzle/             # Migration files
└── package.json
```

### Frontend (`apps/web`)

```
apps/web/
├── src/
│   ├── api/             # API client setup
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Layout components
│   │   ├── ui/          # UI primitives
│   │   └── upload/      # Upload components
│   ├── context/         # React Context providers
│   ├── features/        # Feature modules
│   │   ├── auth/        # Login/OAuth pages
│   │   ├── dashboard/   # Dashboard
│   │   ├── personal/    # Personal leaves
│   │   ├── request/     # Leave requests
│   │   ├── settings/    # Settings
│   │   └── team/        # Team management
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities
│   └── App.tsx          # App root
├── public/              # Static assets
└── package.json
```

### Shared Types (`packages/shared-types`)

```
packages/shared-types/
├── src/
│   ├── user.types.ts
│   ├── team.types.ts
│   ├── leave.types.ts
│   ├── attachment.types.ts
│   └── index.ts         # Central exports
└── package.json
```

## 🔧 Development Workflow

### Adding a New Feature

1. **Backend**: Create a new module in `apps/api/src/modules/`
   - `feature.controller.ts` - Routes and handlers
   - `feature.service.ts` - Business logic
   - `feature.schema.ts` - Validation schemas

2. **Frontend**: Create a new feature in `apps/web/src/features/`
   - Create components
   - Add routing in `App.tsx`
   - Use API client from `src/api/client.ts`

3. **Shared Types**: If needed, add types to `packages/shared-types/src/`

### Database Changes

```bash
# 1. Modify schema in apps/api/src/db/schema.ts
# 2. Generate migration
bun run db:generate

# 3. Review migration in apps/api/drizzle/
# 4. Apply migration
bun run db:migrate
```

## 🧪 Testing

### Backend Testing

Uses Bun's built-in test runner:

```bash
cd apps/api
bun test
```

Example test:

```typescript
import { describe, test, expect } from "bun:test";

describe("Auth Service", () => {
  test("should validate JWT", () => {
    // Your test here
  });
});
```

### Frontend Testing

Uses Vitest + React Testing Library:

```bash
cd apps/web
bun test          # Run tests
bun test:ui       # Interactive UI
bun test:coverage # Coverage report
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and linting: `bun run type-check && bun run lint`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Quality

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for pre-commit hooks
- **TypeScript** for type safety

Pre-commit hooks will automatically run linting and formatting on staged files.

## 📝 API Documentation

API documentation is available via Swagger UI:

- **Development**: http://localhost:3000/swagger
- **Production**: https://your-domain.com/swagger

## 🔐 Security

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- OAuth 2.0 for third-party authentication
- Environment variables for sensitive data
- CORS configured for specific origins
- File upload validation and sanitization

## 📜 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Bun](https://bun.sh/) - Lightning-fast JavaScript runtime
- [Elysia](https://elysiajs.com/) - Ergonomic TypeScript framework
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe ORM
- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool

## 📧 Support

For questions or issues, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ using Bun and modern web technologies**
