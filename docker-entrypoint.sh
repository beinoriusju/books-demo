#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
until php bin/console doctrine:query:sql "SELECT 1" > /dev/null 2>&1; do
    echo "Database not ready, waiting..."
    sleep 2
done

echo "Running database migrations..."
php bin/console doctrine:migrations:migrate --no-interaction

echo "Starting Apache..."
exec apache2-foreground
