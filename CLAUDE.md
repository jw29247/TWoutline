# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Outline is a fast, collaborative wiki and knowledge base built with TypeScript. It's a monorepo application with separate frontend (React) and backend (Koa) components that share common code.

## Documentation

- refer to the docs folder for extensive documentation

## Architecture

### High-Level Structure

- **Frontend** (`/app`): React SPA with Vite, MobX for state management, and Styled Components
- **Backend** (`/server`): Koa.js API server with Sequelize ORM (PostgreSQL) and Redis
- **Shared** (`/shared`): Common TypeScript types, utilities, and constants
- **Plugins** (`/plugins`): Extensible plugin system for auth providers, storage, and integrations

### Key Services (server/services/)

- **web**: Main HTTP API server
- **worker**: Background job processor (Bull queues)
- **websockets**: Real-time updates via Socket.io
- **collaboration**: Y.js collaborative editing server (Hocuspocus)

### Frontend State Management

MobX stores are organized under `app/stores/`:
- `RootStore` aggregates all domain stores
- Domain stores: `DocumentsStore`, `CollectionsStore`, `UsersStore`, etc.
- Stores handle data fetching, caching, and state management
- Access stores via `useStores()` hook in React components

### API Structure

- Routes in `server/routes/api/` organized by resource
- Authentication via JWT tokens or API keys
- Consistent JSON response format with pagination
- Policy-based authorization using `can()` checks

## Development Commands

### Essential Commands

```bash
# Start development environment (PostgreSQL + Redis via Docker)
make up

# Run development server with hot reload
yarn dev:watch

# Run tests
yarn test                # All tests
yarn test:app           # Frontend tests only
yarn test:server        # Backend tests only
yarn test:watch         # Watch mode
yarn test -- --coverage # With coverage

# Linting
yarn lint               # Lint all files
yarn lint:changed       # Lint only changed files
yarn lint --fix        # Auto-fix issues

# Build for production
yarn build              # Build everything
yarn build:vite        # Frontend only
yarn build:server      # Backend only

# Database operations
yarn db:migrate         # Run pending migrations
yarn db:migrate:undo    # Rollback last migration
yarn db:create          # Create new migration
yarn db:seed            # Seed development data

# Translations
yarn translate:download # Download translations from CrowdIn
yarn translate:upload   # Upload source strings to CrowdIn
```

### Running Individual Tests

```bash
# Run specific test file
yarn test app/stores/DocumentsStore.test.ts
yarn test server/routes/api/documents.test.ts

# Run tests matching pattern
yarn test -- --testNamePattern="should create document"
```

## Key Patterns

### Adding a New API Endpoint

1. Create route handler in `server/routes/api/[resource].ts`
2. Add authentication middleware: `auth({ optional: false })`
3. Use transaction wrapper for database operations: `transaction()`
4. Check permissions using policies: `authorize(actor, "read", document)`
5. Return consistent JSON with `ctx.body = { data: ... }`

### Adding a New Store

1. Create store class in `app/stores/[Name]Store.ts`
2. Extend `Store` base class
3. Add to `RootStore` in `app/stores/RootStore.ts`
4. Use `@observable`, `@computed`, and `@action` decorators
5. Implement data fetching methods with error handling

### Database Migrations

```bash
# Create new migration
yarn db:create --name add-field-to-documents

# Migration file pattern: server/migrations/[timestamp]-[name].js
# Use queryInterface methods for schema changes
```

### Testing Patterns

- Use factories for test data: `buildDocument()`, `buildUser()`
- Mock authentication: `server.authenticate(user)`
- Test database transactions are rolled back automatically
- Frontend: use `render()` from test utils for store context

## Configuration

Key environment variables (see `.env.sample`):

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: JWT signing key (required)
- `UTILS_SECRET`: Encryption key (required)
- `URL`: Public URL of the application
- `FILE_STORAGE`: Storage backend (local/s3)
- `SMTP_*`: Email configuration
- `SENTRY_DSN`: Error tracking (optional)

## Plugin Development

Plugins can extend:
- Authentication providers (`auth/`)
- File storage backends (`storage/`)
- Third-party integrations (`[service]/`)

Plugin structure:
```typescript
export default class MyPlugin implements PluginInterface {
  id = "my-plugin";
  name = "My Plugin";
  
  router?: Router;        // Add API routes
  migrations?: Migration[]; // Database migrations
  env?: Record<string, string>; // Required env vars
}
```

## Component Patterns

### React Components

- Use functional components with hooks
- Styled Components for styling
- Lazy load with `React.lazy()` for code splitting
- Use `observer()` HOC for MobX reactivity
- Translations via `useTranslation()` hook

### Editor Components

- ProseMirror-based rich text editor
- Custom nodes/marks in `shared/editor/nodes/`
- Collaborative editing via Y.js
- Extensions system for editor features

## Background Jobs

Queue jobs using Bull:
```typescript
import { taskQueue } from "@server/queues";

taskQueue.add({
  name: "ProcessDocument",
  data: { documentId },
});
```

Process in `server/queues/tasks/`:
- Each task is a separate file
- Implements `perform()` method
- Handles retries and error states

## WebSocket Events

Real-time updates via Socket.io:
- Events defined in `shared/types/events.ts`
- Emit from server: `websocketServer.emit("documents.update", data)`
- Subscribe in frontend via `SocketProvider`

## Security Considerations

- All user input is sanitized (XSS protection)
- CSRF protection via tokens
- Rate limiting on API endpoints
- File upload restrictions
- SQL injection prevention via Sequelize
- Permission checks on all data access
```