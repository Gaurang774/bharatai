#!/usr/bin/env sh
# =====================================================
# BharatAI — Ollama Model Setup Script
# Run AFTER docker compose up to register the custom
# BharatAI Modelfile (system prompt + parameters).
# =====================================================

set -e

OLLAMA_HOST=${OLLAMA_HOST:-http://localhost:11434}

echo ""
echo "================================================="
echo "  BharatAI — Sovereign Model Registration"
echo "================================================="

# Wait until Ollama is ready
echo ">>> Waiting for Ollama to be available..."
until curl -sf "${OLLAMA_HOST}/api/tags" > /dev/null; do
    printf "."
    sleep 2
done
echo ""
echo ">>> Ollama is live!"

# Pull the base model first (in case it hasn't been pulled yet)
echo ">>> Pulling base llama3 (skip if already downloaded)..."
curl -sf "${OLLAMA_HOST}/api/pull" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"name": "llama3"}' | tail -1

echo ""
echo ">>> Creating BharatAI sovereign model from Modelfile..."

# Create the custom BharatAI model from Modelfile
MODELFILE=$(cat "$(dirname "$0")/Modelfile")
curl -sf "${OLLAMA_HOST}/api/create" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"bharatai\", \"modelfile\": $(echo "$MODELFILE" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}"

echo ""
echo "================================================="
echo "  SUCCESS! BharatAI Sovereign Model is ready."
echo "  Update OLLAMA_MODEL=bharatai in .env to use it"
echo "  (default stays as llama3 which also works fine)"
echo "================================================="
