#!/bin/bash

set -euo pipefail

LANGUAGES=(js ts)
DIALECTS=(mssql mysql postgres sqlite)

for lang in "${LANGUAGES[@]}"; do
  for dialect in "${DIALECTS[@]}"; do
    echo "Testing $lang + $dialect..."
    cd testdata/$lang

    if [[ "$lang" == "ts" ]]; then
      npx ts-node load-entities.ts $dialect > actual-schema.sql
    else
      node load-entities.js $dialect > actual-schema.sql
    fi

    EXPECTED_FILE="output/$dialect/schema.sql"
    if ! diff -u -b "$EXPECTED_FILE" actual-schema.sql; then
      echo "Mismatch detected for $lang + $dialect"
      rm -f actual-schema.sql
      exit 1
    fi

    rm -f actual-schema.sql

    echo "$lang + $dialect passed"
    cd - > /dev/null
  done
done

echo "All schema outputs match!"
