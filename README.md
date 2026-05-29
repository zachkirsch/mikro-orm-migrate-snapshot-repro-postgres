# `migrator.up()` overwrites the committed snapshot (Postgres)

## Repro

```
# in terminal 1
docker compose up

# in terminal 2
npm install
npm run repro
git diff
```

Expected: clean `git diff` (the committed snapshot already matches the entities + migration).

Actual: `src/migrations/.snapshot-postgres.json` is rewritten — `migrator.up()` writes the snapshot from DB introspection while `migration:create` writes it from entity metadata, and on Postgres the two diverge in at least these categories:

- `current_timestamp` -> `CURRENT_TIMESTAMP`
- native enums `"enum"` -> `"unknown"`
- `geometry(point, 4326)` -> `geometry`
- CHECK and generated-column expressions reformatted by Postgres on storage (`coalesce` -> `COALESCE`, parens rewrapped, `STORED` -> `stored`, partial-index `where` clause reformatted, etc.)
- Long identifier names truncated to 63 chars by Postgres
- Index `"type"` (e.g. `gin`) only populated from introspection
