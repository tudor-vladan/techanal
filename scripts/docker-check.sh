#!/bin/bash

echo "🔍 Verific configurația Docker pentru TechAnal..."
echo ""

# Verifică Docker
echo "🐳 Verific Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker este instalat: $(docker --version)"
else
    echo "❌ Docker nu este instalat!"
    exit 1
fi

# Verifică Docker Compose
echo "🐳 Verific Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose este instalat: $(docker-compose --version)"
else
    echo "❌ Docker Compose nu este instalat!"
    exit 1
fi

# Verifică dacă Docker daemon rulează
echo "🔧 Verific Docker daemon..."
if docker info > /dev/null 2>&1; then
    echo "✅ Docker daemon rulează"
else
    echo "❌ Docker daemon nu rulează. Te rog să pornești Docker Desktop."
    exit 1
fi

# Verifică fișierele Docker
echo "📁 Verific fișierele Docker..."
if [ -f "docker-compose.yml" ]; then
    echo "✅ docker-compose.yml există"
else
    echo "❌ docker-compose.yml lipsește!"
    exit 1
fi

if [ -f "docker-compose.prod.yml" ]; then
    echo "✅ docker-compose.prod.yml există"
else
    echo "❌ docker-compose.prod.yml lipsește!"
    exit 1
fi

if [ -f "server/Dockerfile.dev" ]; then
    echo "✅ server/Dockerfile.dev există"
else
    echo "❌ server/Dockerfile.dev lipsește!"
    exit 1
fi

if [ -f "ui/Dockerfile.dev" ]; then
    echo "✅ ui/Dockerfile.dev există"
else
    echo "❌ ui/Dockerfile.dev lipsește!"
    exit 1
fi

# Verifică scripturile
echo "📜 Verific scripturile..."
if [ -x "scripts/docker-start.sh" ]; then
    echo "✅ scripts/docker-start.sh este executabil"
else
    echo "❌ scripts/docker-start.sh nu este executabil!"
fi

if [ -x "scripts/docker-stop.sh" ]; then
    echo "✅ scripts/docker-stop.sh este executabil"
else
    echo "❌ scripts/docker-stop.sh nu este executabil!"
fi

if [ -x "scripts/docker-prod.sh" ]; then
    echo "✅ scripts/docker-prod.sh este executabil"
else
    echo "❌ scripts/docker-prod.sh nu este executabil!"
fi

# Verifică Makefile
echo "🔨 Verific Makefile..."
if [ -f "Makefile" ]; then
    echo "✅ Makefile există"
else
    echo "❌ Makefile lipsește!"
    exit 1
fi

# Verifică fișierul env.example
echo "⚙️ Verific configurația..."
if [ -f "env.example" ]; then
    echo "✅ env.example există"
else
    echo "❌ env.example lipsește!"
    exit 1
fi

echo ""
echo "🎉 Configurația Docker este completă și gata de utilizare!"
echo ""
echo "🚀 Pentru a porni aplicația:"
echo "   make dev          # Development"
echo "   make prod         # Production"
echo ""
echo "📚 Pentru ajutor:"
echo "   make help         # Toate comenzile disponibile"
