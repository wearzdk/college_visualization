.PHONY: dev
dev:
	@echo "Starting development server..."
	@uv run fastapi dev backend/api.py

.PHONY: build_docker
build_docker:
	@echo "Building docker image..."
	@docker buildx build -t starter-python:latest .

.PHONY: prod
prod:
	@echo "Building application..."
	@uv run fastapi run backend/api.py