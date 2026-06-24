FROM php:8.4-cli

# Install Node.js 22 + npm
RUN apt-get update && apt-get install -y curl ca-certificates gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install PHP extensions needed by Laravel (SQLite + PostgreSQL)
RUN apt-get update && apt-get install -y libsqlite3-dev libpq-dev \
    && docker-php-ext-install pdo_sqlite pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

# Install zip extension + unzip for Composer
RUN apt-get update && apt-get install -y unzip libzip-dev \
    && docker-php-ext-install zip \
    && rm -rf /var/lib/apt/lists/*

ENV COMPOSER_ALLOW_SUPERUSER=1

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
