#!/bin/bash

echo "🛑 Oprește TechAnal..."

# Oprește și șterge containerele
docker-compose down

# Opțional: șterge și volumele (atenție - va șterge datele din baza de date)
if [ "$1" = "--clean" ]; then
    echo "🧹 Șterge volumele și imagini..."
    docker-compose down -v --rmi all
    docker system prune -f
fi

echo "✅ TechAnal a fost oprit!"
