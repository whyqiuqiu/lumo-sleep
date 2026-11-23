#!/usr/bin/env bash
set -euo pipefail
host_release=$(readlink -f /home/web/ai-digital-sandplay/current)
case "$host_release" in /home/web/ai-digital-sandplay/releases/*) ;; *) exit 1;; esac
backup=/home/web/lumo-demo/backups/sandplay-deploy-server-20261013.mjs
test -f "$backup"
test -f /home/web/lumo-demo/releases/20261013-glass-auto/index.html
ln -sfn /home/web/lumo-demo/releases/20261013-glass-auto /home/web/lumo-demo/current
cp /tmp/sandplay-with-lumo.mjs "$host_release/deploy-server.mjs"
pm2 restart ai-digital-sandplay-9600 --update-env
ready=0
for attempt in 1 2 3 4 5 6; do
 if curl -fsS http://127.0.0.1:9600/lumo/ | grep -q '/lumo/assets/'; then ready=1; break; fi
 sleep 1
done
if [ "$ready" != 1 ] || ! curl -fsS http://127.0.0.1:9600/ >/dev/null; then
 cp "$backup" "$host_release/deploy-server.mjs"
 pm2 restart ai-digital-sandplay-9600 --update-env
 echo 'Activation failed and was rolled back'
 exit 1
fi
echo 'Lumo activated at /lumo/; sandplay homepage verified'
