#!/usr/bin/env bash
# Copia o vault Obsidian para docs/ (ver docs Decisoes D8).
# docs/ é snapshot publicado: editar lá é inútil, esta cópia sobrescreve.
set -euo pipefail

VAULT="${DOCKET_VAULT:-$HOME/Documents/documentacao/obsidian/docket}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/docs"

[ -d "$VAULT" ] || { echo "vault não encontrado: $VAULT" >&2; exit 1; }

rm -rf "$DEST"
mkdir -p "$DEST"
rsync -a --exclude '.obsidian/' --exclude '.trash/' "$VAULT"/ "$DEST"/

echo "docs/ atualizado a partir de $VAULT"
find "$DEST" -name '*.md' | wc -l | xargs echo "arquivos:"
