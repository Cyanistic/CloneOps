#!/bin/sh
npx swagger-typescript-api generate --generate-union-enums -p http://localhost:6969/api-docs/openapi.json -n Api.ts
