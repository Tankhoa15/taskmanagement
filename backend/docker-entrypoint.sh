#!/bin/sh
set -eu

if [ -n "${DATABASE_URL:-}" ] && [ -z "${QUARKUS_DATASOURCE_JDBC_URL:-}" ]; then
  database_url="${DATABASE_URL#postgres://}"
  database_url="${database_url#postgresql://}"

  credentials="${database_url%%@*}"
  host_and_database="${database_url#*@}"
  host_and_port="${host_and_database%%/*}"
  database_and_query="${host_and_database#*/}"
  database_name="${database_and_query%%\?*}"
  query_string=""
  if [ "$database_and_query" != "$database_name" ]; then
    query_string="?${database_and_query#*\?}"
  fi

  export QUARKUS_DATASOURCE_USERNAME="${QUARKUS_DATASOURCE_USERNAME:-${DB_USERNAME:-${credentials%%:*}}}"
  export QUARKUS_DATASOURCE_PASSWORD="${QUARKUS_DATASOURCE_PASSWORD:-${DB_PASSWORD:-${credentials#*:}}}"
  export QUARKUS_DATASOURCE_JDBC_URL="jdbc:postgresql://${host_and_port}/${database_name}${query_string}"
fi

if [ -z "${QUARKUS_DATASOURCE_JDBC_URL:-}" ]; then
  if [ -n "${DB_HOST:-}" ] && [ -n "${DB_NAME:-}" ]; then
    export QUARKUS_DATASOURCE_JDBC_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT:-5432}/${DB_NAME}"
  else
    echo "Database is not configured. Set DATABASE_URL or QUARKUS_DATASOURCE_JDBC_URL on Render."
    exit 1
  fi
fi

export QUARKUS_DATASOURCE_USERNAME="${QUARKUS_DATASOURCE_USERNAME:-${DB_USERNAME:-}}"
export QUARKUS_DATASOURCE_PASSWORD="${QUARKUS_DATASOURCE_PASSWORD:-${DB_PASSWORD:-}}"

if [ -z "${QUARKUS_DATASOURCE_USERNAME:-}" ] || [ -z "${QUARKUS_DATASOURCE_PASSWORD:-}" ]; then
  echo "Database credentials are not configured. Set DATABASE_URL, or set QUARKUS_DATASOURCE_USERNAME and QUARKUS_DATASOURCE_PASSWORD."
  exit 1
fi

exec java -Dquarkus.http.port="${PORT:-10000}" -jar quarkus-run.jar
