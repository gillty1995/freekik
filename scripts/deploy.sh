#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_SSH_KEY:?Set DEPLOY_SSH_KEY to the path of your SSH private key}"
: "${DEPLOY_USER:?Set DEPLOY_USER to the SSH username}"
: "${DEPLOY_HOST:?Set DEPLOY_HOST to the deployment host}"
: "${DEPLOY_PATH:?Set DEPLOY_PATH to the destination path on the server}"
DEPLOY_PM2_APP="${DEPLOY_PM2_APP:-freekik}"

ssh_cmd=(ssh -i "$DEPLOY_SSH_KEY")
if [[ -n "${DEPLOY_PORT:-}" ]]; then
  ssh_cmd+=(-p "$DEPLOY_PORT")
fi

rsync -av \
  --exclude node_modules \
  --exclude .next \
  --exclude .env* \
  --exclude .git \
  -e "${ssh_cmd[*]}" \
  . \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"

remote_cmd=$(printf \
  'source "$HOME/.nvm/nvm.sh" && nvm use 22 && cd %q && npm ci && npm run build && pm2 restart %q --update-env' \
  "$DEPLOY_PATH" "$DEPLOY_PM2_APP")

"${ssh_cmd[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}" "$remote_cmd"
