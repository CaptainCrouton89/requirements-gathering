# SQLite Migration Guide

This guide explains how to migrate your requirements gathering application from JSON file storage to SQLite.

## Benefits of SQLite

- **Data Integrity**: SQLite provides ACID compliance and enforces data relationships
- **Performance**: Better performance for large datasets and complex queries
- **Concurrency**: Improved handling of concurrent operations
- **Advanced Querying**: More powerful filtering, sorting, and searching capabilities

## Prerequisites

- Node.js v14.21.1 or later
- pnpm package manager

## Migration Process

### Step 1: Build the Application

First, build the application to compile the TypeScript code:

```bash
pnpm build
```

### Step 2: Run the Migration Tool

The migration tool will transfer data from the existing JSON files to the new SQLite database:

```bash
pnpm migrate
```

This will:

- Create a new SQLite database in the same directory as your JSON files
- Migrate all projects and requirements data
- Create backup copies of your original JSON files

### Step 3: Switch to SQLite Storage

The application will now use SQLite by default. No additional configuration is needed.

If you want to switch back to JSON storage, set the `STORAGE_TYPE` environment variable:

```bash
STORAGE_TYPE=json pnpm start
```

## Configuration

The following environment variables can be used to configure the storage:

- `STORAGE_TYPE`: Set to either `sqlite` (default) or `json`
- `DATA_DIR`: Override the default data directory location

## Troubleshooting

### Migration Errors

If you encounter errors during migration:

1. Check that the JSON files exist and contain valid data
2. Ensure you have write permissions to the data directory
3. Verify that the SQLite database file can be created

### Database Access Errors

If you encounter errors accessing the SQLite database:

1. Make sure the database file exists and is not corrupted
2. Check file permissions
3. Verify the data directory path is correct

## Schema Management

The SQLite schema can be managed using Drizzle Kit:

```bash
# Generate migrations
pnpm drizzle:generate

# Apply migrations
pnpm drizzle:push
```
