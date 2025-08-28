#!/bin/bash

echo "🚀 Pornesc TechAnal cu Docker..."

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

# Oprește containerele existente dacă rulează
echo "🛑 Oprește containerele existente..."
docker-compose down

# Construiește și pornește serviciile
echo "🔨 Construiește și pornește serviciile..."
docker-compose up --build -d

# Așteaptă ca serviciile să pornească
echo "⏳ Așteaptă ca serviciile să pornească..."
sleep 10

# Verifică statusul serviciilor
echo "📊 Statusul serviciilor:"
docker-compose ps

echo ""
echo "✅ TechAnal a pornit cu succes!"
echo ""
echo "🌐 Aplicații disponibile:"
echo "   Frontend (UI):     http://localhost:5501"
echo "   Backend (API):     http://localhost:5500"
echo "   Database:          localhost:5502"
echo "   Firebase Auth:     http://localhost:5503"
echo ""
echo "📝 Comenzi utile:"
echo "   Verifică log-urile: docker-compose logs -f"
echo "   Oprește:           docker-compose down"
echo "   Restart:           docker-compose restart"
