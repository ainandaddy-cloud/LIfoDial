.PHONY: dev-backend dev-agent dev-all

dev-backend:
	uvicorn backend.main:app --reload --port 8001

dev-agent:
	python -m backend.agent.pipeline dev

dev-all:
	@echo "Starting Uvicorn and LiveKit Agent..."
	@start "Lifodial Backend" uvicorn backend.main:app --reload --port 8001
	@start "LiveKit Agent" python -m backend.agent.pipeline dev

