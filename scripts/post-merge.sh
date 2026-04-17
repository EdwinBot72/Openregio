#!/bin/bash
set -e

echo "[post-merge] Installing dependencies..."
npm install --prefer-offline --legacy-peer-deps

echo "[post-merge] Done. Database migrations run automatically on server start."
