# Directus CMS con SQLite. Todo lo persistente vive en /directus/data
# (un solo volumen de Fly: base de datos + archivos subidos).
FROM directus/directus:12.4.1

USER root
COPY --chmod=755 start.sh /directus/start.sh

ENV DB_CLIENT=sqlite3 \
    DB_FILENAME=/directus/data/database/data.db \
    STORAGE_LOCATIONS=local \
    STORAGE_LOCAL_ROOT=/directus/data/uploads \
    EXTENSIONS_PATH=/directus/extensions \
    PORT=8055

EXPOSE 8055
ENTRYPOINT ["/directus/start.sh"]
