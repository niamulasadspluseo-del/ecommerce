FROM php:8.3-cli

WORKDIR /app

# Install system deps + PHP extensions
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_sqlite \
    && apt-get clean

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy app files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Generate APP_KEY if not set via env
RUN php artisan key:generate --force

EXPOSE 8080

# Entrypoint: ensure DB exists, run migrations, then serve
CMD ["sh", "-c", "touch database/database.sqlite && php artisan migrate --force --seed && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]
