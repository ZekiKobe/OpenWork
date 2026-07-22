# Docker Setup Guide

This project uses Docker Compose to run the entire application stack.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Node.js (for local development, optional)

## Quick Start

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

## Database Management

All database commands are in the `backend` directory:

```bash
cd backend
```

### Create Database
```bash
npm run db:create
```

### Drop Database
```bash
npm run db:drop
```

### Reset Database (drop and create)
```bash
npm run db:reset
```

### Access Database Shell
```bash
npm run db:shell
```

### Run Migrations
```bash
npm run migrate
```

### Run Seeders
```bash
npm run seed
```

### Complete Setup (create DB + migrate + seed)
```bash
npm run db:setup
```

### Other Migration Commands
```bash
npm run migrate:undo        # Undo last migration
npm run migrate:undo:all    # Undo all migrations
npm run migrate:status      # Check migration status
npm run seed:undo          # Undo last seeder
npm run seed:undo:all      # Undo all seeders
```

## Services

- **Database (MySQL)**: `localhost:3306`
- **Backend API**: `http://localhost:3001`
- **Frontend**: `http://localhost:5173`

## Environment Variables

Create a `.env` file in the root directory (or use the provided `.env.example` as a template):

```env
DB_HOST=db
DB_PORT=3306
DB_NAME=OpenWork_db
DB_USER=root
DB_PASSWORD=rootpassword

JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRE=7d

NODE_ENV=development
BACKEND_PORT=3001
FRONTEND_PORT=5173

VITE_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
```

## Development

### Running in Development Mode

The docker-compose setup uses volume mounts for hot-reloading:
- Backend changes are automatically reflected
- Frontend changes are automatically reflected

### Rebuilding Containers

If you make changes to Dockerfiles or need to rebuild:
```bash
docker-compose build
docker-compose up -d
```

### Clean Everything (including volumes)

```bash
docker-compose down -v
```

This will remove all containers, networks, and volumes.

## Troubleshooting

1. **Port already in use**: Change the ports in `.env` or `docker-compose.yml`
2. **Database connection issues**: Wait for the database to be healthy (check with `docker-compose ps`)
3. **Permission issues**: Make sure Docker has proper permissions

## Notes

- The database is automatically initialized with the `init-db.sql` script on first run
- Data persists in a Docker volume (`mysql_data`)
- To reset everything, use `npm run docker:clean`
