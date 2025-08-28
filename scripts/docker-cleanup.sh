#!/bin/bash

echo "🧹 Cleanup Docker pentru TechAnal..."

# Oprește toate containerele
echo "🛑 Oprește containerele..."
docker-compose down
docker-compose -f docker-compose.prod.yml down

# Șterge containerele oprite
echo "🗑️ Șterge containerele oprite..."
docker container prune -f

# Șterge imagini nefolosite
echo "🖼️ Șterge imagini nefolosite..."
docker image prune -f

# Șterge volumele nefolosite
echo "💾 Șterge volumele nefolosite..."
docker volume prune -f

# Șterge rețelele nefolosite
echo "🌐 Șterge rețelele nefolosite..."
docker network prune -f

# Cleanup complet (opțional)
if [ "$1" = "--all" ]; then
    echo "🔥 Cleanup complet - șterge tot..."
    docker system prune -a -f --volumes
fi

echo ""
echo "✅ Cleanup complet!"
echo ""
echo "📊 Status Docker:"
docker system df
