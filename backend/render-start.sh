#!/usr/bin/env bash
# Render startup script for Laravel backend
cd "$(dirname "$0")"

# Create SQLite database if needed
touch database/database.sqlite

# Run migrations and seed
php artisan migrate --force --seed

# Start the server
php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
