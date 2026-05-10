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

exec java -Dquarkus.http.port="${PORT:-10000}" -jar quarkus-run.jar
