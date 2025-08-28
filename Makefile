.PHONY: help dev prod stop clean logs build

help: ## Afișează ajutorul
	@echo "🚀 TechAnal Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Pornește aplicația în modul development"
	@echo "  make dev-build    - Construiește și pornește în development"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Pornește aplicația în modul producție"
	@echo "  make prod-build   - Construiește și pornește în producție"
	@echo ""
	@echo "Management:"
	@echo "  make stop         - Oprește toate containerele"
	@echo "  make clean        - Oprește și șterge volumele/imagini"
	@echo "  make clean-all    - Cleanup complet - șterge tot"
	@echo "  make logs         - Afișează log-urile"
	@echo "  make status       - Afișează statusul serviciilor"
	@echo ""

dev: ## Pornește în development
	@./scripts/docker-start.sh

dev-build: ## Construiește și pornește în development
	docker-compose up --build -d

prod: ## Pornește în producție
	@./scripts/docker-prod.sh

prod-build: ## Construiește și pornește în producție
	docker-compose -f docker-compose.prod.yml up --build -d

stop: ## Oprește toate containerele
	docker-compose down
	docker-compose -f docker-compose.prod.yml down

clean: ## Oprește și șterge volumele/imagini
	@./scripts/docker-cleanup.sh

clean-all: ## Cleanup complet - șterge tot
	@./scripts/docker-cleanup.sh --all

logs: ## Afișează log-urile
	docker-compose logs -f

logs-prod: ## Afișează log-urile din producție
	docker-compose -f docker-compose.prod.yml logs -f

status: ## Afișează statusul serviciilor
	@echo "📊 Development Services:"
	docker-compose ps
	@echo ""
	@echo "📊 Production Services:"
	docker-compose -f docker-compose.prod.yml ps

restart: ## Restart development
	docker-compose restart

restart-prod: ## Restart production
	docker-compose -f docker-compose.prod.yml restart
