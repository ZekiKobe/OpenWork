# Database Migrations Guide

This project uses Sequelize CLI for database migrations. Migrations work with both Docker and local MySQL.

## Prerequisites

Make sure you have:
1. Database created (`npm run db:create`)
2. `.env` file configured with correct database credentials
3. For Docker: `DB_HOST=db` (service name)
4. For local MySQL: `DB_HOST=localhost`

## Migration Commands

### Run Migrations
```bash
npm run migrate
```
Runs all pending migrations in order.

### Check Migration Status
```bash
npm run migrate:status
```
Shows which migrations have been run and which are pending.

### Undo Last Migration
```bash
npm run migrate:undo
```
Reverts the last migration that was run.

### Undo All Migrations
```bash
npm run migrate:undo:all
```
Reverts all migrations (use with caution!).

### Generate New Migration
```bash
npm run migrate:generate -- create-users-table
```
Creates a new migration file. The `--` is required to pass the name argument.

**Example:**
```bash
npm run migrate:generate -- add-phone-to-users
```
This creates a file like: `20260110120000-add-phone-to-users.js`

## Migration File Structure

Migrations are located in `backend/migrations/` and follow this structure:

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Migration code here
    await queryInterface.createTable('table_name', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // ... other columns
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback code here
    await queryInterface.dropTable('table_name');
  }
};
```

## Working with Docker

When using Docker, make sure your `.env` has:
```env
DB_HOST=db
DB_PORT=3306
DB_NAME=OpenWork_db
DB_USER=root
DB_PASSWORD=rootpassword
```

Then run migrations from the backend directory:
```bash
cd backend
npm run migrate
```

## Working with Local MySQL

When using local MySQL, make sure your `.env` has:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=OpenWork_db
DB_USER=root
DB_PASSWORD=your_password
```

Then run migrations:
```bash
cd backend
npm run migrate
```

## Complete Setup

To set up the database from scratch:
```bash
cd backend
npm run db:setup
```

This will:
1. Create the database
2. Run all migrations
3. Run all seeders

## Best Practices

1. **Always test migrations** before committing
2. **Write reversible migrations** - ensure `down()` properly undoes `up()`
3. **Use descriptive names** for migration files
4. **Never edit existing migrations** - create new ones instead
5. **Run migrations in order** - don't skip migrations
6. **Backup before major migrations** in production

## Troubleshooting

### Migration fails with connection error
- Check your `.env` file has correct credentials
- For Docker: Ensure containers are running (`docker-compose ps`)
- For local: Ensure MySQL service is running

### Migration already exists error
- Check migration status: `npm run migrate:status`
- If migration was partially run, you may need to manually fix the database state

### Migration order issues
- Migrations run in timestamp order (filename order)
- Don't change migration file names after they've been run
- If you need to reorder, create new migrations instead
