#!/bin/bash
set -e

echo "=== Building Flor de Liz para produção ==="

echo "--- Construindo portal do cliente..."
BASE_PATH=/portal-cliente/ PORT=3000 pnpm --filter @workspace/portal-cliente build

echo "--- Construindo app principal (PDV)..."
BASE_PATH=/ PORT=3000 pnpm --filter @workspace/boticario build

echo "--- Construindo servidor de API..."
pnpm --filter @workspace/api-server build

echo "=== Build concluído ==="
