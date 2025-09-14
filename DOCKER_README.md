# Docker Setup for Context Search API

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop
docker-compose down
```

### Using Docker directly

```bash
# Build
docker build -t context-api .

# Run
docker run -p 8000:8000 \
  -v $(pwd)/chroma_db:/app/chroma_db \
  -v $(pwd)/context_maps.db:/app/context_maps.db \
  context-api
```

## Access

- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Notes

- Uses mock mode by default (`api_server_simple.py`)
- Data persists in `./chroma_db` and `./context_maps.db`
- For production with full AI, change CMD in Dockerfile to `api_server.py`
