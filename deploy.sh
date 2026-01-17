#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to deploy."
  exit 0
fi
msg=${1:-"Update site"}
git add .
git commit -m "$msg"
git push
