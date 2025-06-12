# Simple Symfony Dockerfile for demo
FROM php:8.2-apache

# Install basic PHP extensions
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libicu-dev \
    libzip-dev \
    unzip \
    && docker-php-ext-install \
    pdo_pgsql \
    intl \
    zip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install Node.js and pnpm for frontend build
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Set production environment variables
ENV APP_ENV=prod
ENV APP_DEBUG=0

# Install PHP dependencies with proper environment
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Install frontend dependencies and build assets
RUN pnpm install --frozen-lockfile \
    && pnpm run build

# Clear and warm up Symfony cache for production
RUN php bin/console cache:clear --env=prod --no-debug \
    && php bin/console cache:warmup --env=prod --no-debug

# Set permissions
RUN chown -R www-data:www-data /var/www/html/var

# Run database migrations (requires DATABASE_URL to be set)
# Note: This will only work if database is accessible during build
# RUN php bin/console doctrine:migrations:migrate --no-interaction

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Configure Apache document root
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copy and make startup script executable
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 80

# Use custom entrypoint that runs migrations
CMD ["/usr/local/bin/docker-entrypoint.sh"]