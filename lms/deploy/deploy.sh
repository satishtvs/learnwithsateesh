#!/bin/bash
# Run ON THE SERVER from the repo's lms/ directory:  bash deploy/deploy.sh
# Idempotent: pulls, builds the SPA into /var/www/lws/dist, (re)starts the docker stack, runs migrations (container start)
# and the seed. Does NOT touch nginx or other sites; see deploy/README.md for the one-time nginx/certbot setup.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo "Missing lms/.env (copy .env.example and fill it in)"; exit 1; }

echo ">>> git pull"
git -C .. pull --ff-only

echo ">>> frontend build"
(cd frontend && npm ci --silent && npm run build)
sudo mkdir -p /var/www/lws
sudo rsync -a --delete frontend/dist/ /var/www/lws/dist/

echo ">>> docker stack"
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

echo ">>> waiting for API"
for i in $(seq 1 30); do
  curl -sf http://127.0.0.1:8000/api/health >/dev/null && break
  sleep 2
done
curl -sf http://127.0.0.1:8000/api/health && echo

echo ">>> seed (idempotent)"
docker compose -f docker-compose.prod.yml --env-file .env exec -T backend python -m app.seed
echo ">>> done"
