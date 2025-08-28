#!/bin/bash

echo "🚀 Pornesc TechAnal în modul PRODUCȚIE cu Docker..."

# Verifică dacă Docker este rulat
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker nu rulează. Te rog să pornești Docker Desktop."
    exit 1
fi

# Verifică dacă docker-compose este disponibil
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose nu este disponibil. Te rog să îl instalezi."
    exit 1
fi

# Verifică dacă există fișierul .env
if [ ! -f .env ]; then
    echo "❌ Fișierul .env nu există!"
    echo "📝 Te rog să creezi un fișier .env bazat pe env.example"
    echo "   cp env.example .env"
    echo "   # Apoi editează .env cu valorile tale reale"
    exit 1
fi

# Oprește containerele existente dacă rulează
echo "🛑 Oprește containerele existente..."
docker-compose -f docker-compose.prod.yml down

# Construiește și pornește serviciile în producție
echo "🔨 Construiește și pornește serviciile în producție..."
docker-compose -f docker-compose.prod.yml up --build -d

# Așteaptă ca serviciile să pornească
echo "⏳ Așteaptă ca serviciile să pornească..."
sleep 15

# Verifică statusul serviciilor
echo "📊 Statusul serviciilor:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ TechAnal PRODUCȚIE a pornit cu succes!"
echo ""
echo "🌐 Aplicații disponibile:"
echo "   Frontend (UI):     http://localhost"
echo "   Backend (API):     http://localhost:8787"
echo "   Database:          localhost:5432"
echo ""
echo "📝 Comenzi utile:"
echo "   Verifică log-urile: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Oprește:           docker-compose -f docker-compose.prod.yml down"
echo "   Restart:           docker-compose -f docker-compose.prod.yml restart"
