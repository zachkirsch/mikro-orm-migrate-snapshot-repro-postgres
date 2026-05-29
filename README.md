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

```diff
diff --git a/src/migrations/.snapshot-postgres.json b/src/migrations/.snapshot-postgres.json
index 45937f5..10bd6c5 100644
--- a/src/migrations/.snapshot-postgres.json
+++ b/src/migrations/.snapshot-postgres.json
@@ -36,7 +36,7 @@
           "length": 6,
           "precision": null,
           "scale": null,
-          "default": "current_timestamp",
+          "default": "CURRENT_TIMESTAMP",
           "comment": null,
           "collation": null,
           "enumItems": [],
@@ -75,7 +75,7 @@
           "collation": null,
           "enumItems": [],
           "mappedType": "integer",
-          "generated": "(coalesce(balance, 0) * 2) STORED"
+          "generated": "(COALESCE(balance, 0) * 2) stored"
         },
         "id": {
           "name": "id",
@@ -96,7 +96,7 @@
         },
         "location": {
           "name": "location",
-          "type": "geometry(point, 4326)",
+          "type": "geometry",
           "unsigned": false,
           "autoincrement": false,
           "primary": false,
@@ -129,7 +129,7 @@
             "ACTIVE",
             "ARCHIVED"
           ],
-          "mappedType": "enum",
+          "mappedType": "unknown",
           "nativeEnumName": "account_status"
         }
       },
@@ -142,8 +142,7 @@
           "constraint": false,
           "keyName": "account_data_gin",
           "primary": false,
-          "unique": false,
-          "type": "gin"
+          "unique": false
         },
         {
           "columnNames": [
@@ -158,9 +157,10 @@
       ],
       "checks": [
         {
-          "name": "this_is_an_absurdly_long_check_constraint_name_to_trigger_postgres_truncation",
+          "name": "this_is_an_absurdly_long_check_constraint_name_to_trigger_postg",
           "expression": "balance >= 0",
-          "definition": "check (balance >= 0)"
+          "definition": "CHECK ((balance >= 0))",
+          "columnName": "balance"
         }
       ],
       "triggers": [],
@@ -261,7 +261,7 @@
           "keyName": "order_pending_unique_ref",
           "primary": false,
           "unique": true,
-          "where": "status = 'PENDING'"
+          "where": "(status)::text = 'PENDING'::text"
         }
       ],
       "checks": [],
```