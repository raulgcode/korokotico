#!/bin/sh
# Los volúmenes de Fly se montan como root: creamos las carpetas,
# se las damos al usuario "node" y arrancamos Directus como ese usuario.
set -e
mkdir -p /directus/data/database /directus/data/uploads
chown -R node:node /directus/data
exec su node -s /bin/sh -c "cd /directus && exec node docker-entrypoint.cjs"
