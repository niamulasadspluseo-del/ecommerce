FROM node:22-bookworm

# Install PHP 8.2 + Composer + SQLite support
RUN apt-get update && apt-get install -y \
    php8.2-cli \
    php8.2-sqlite3 \
    php8.2-mbstring \
    php8.2-xml \
    php8.2-curl \
    composer \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy entire repo
COPY . .

# Create .env (not tracked in git)
RUN cp backend/.env.example backend/.env

# Install backend dependencies
RUN composer install --working-dir=backend --no-dev --optimize-autoloader

# Install frontend dependencies and build
RUN npm install && npm run build

EXPOSE 8080

# Single entrypoint: runs PHP + SSR behind a proxy
CMD ["node", "start.js"]
