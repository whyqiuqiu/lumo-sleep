#!/usr/bin/env bash
set -euo pipefail
name=${1:?release name required}
checksum=${2:?checksum required}
[[ "$name" =~ ^[a-zA-Z0-9_-]+$ ]]
[[ "$checksum" =~ ^[a-fA-F0-9]{64}$ ]]
archive="/tmp/lumo-$name.tar.gz"
release="/home/web/lumo-demo/releases/$name"
previous=$(readlink -f /home/web/lumo-demo/current)
case "$previous" in /home/web/lumo-demo/releases/*) ;; *) exit 1;; esac
test ! -e "$release"
printf '%s  %s\n' "$checksum" "$archive" | sha256sum -c -
mkdir -p "$release"
tar -xzf "$archive" -C "$release"
test -f "$release/index.html"
grep -q '/lumo/assets/' "$release/index.html"
# Keep hashed assets from the previous release for already-open browser tabs.
cp -an "$previous/assets/." "$release/assets/"
ln -sfn "$release" /home/web/lumo-demo/current-next
mv -Tf /home/web/lumo-demo/current-next /home/web/lumo-demo/current
if ! curl -fsS http://127.0.0.1:9600/lumo/ | grep -q '/lumo/assets/'; then
 ln -sfn "$previous" /home/web/lumo-demo/current-next
 mv -Tf /home/web/lumo-demo/current-next /home/web/lumo-demo/current
 exit 1
fi
curl -fsS http://127.0.0.1:9600/ >/dev/null
printf 'Previous release: %s\nCurrent release: %s\n' "$previous" "$release"
