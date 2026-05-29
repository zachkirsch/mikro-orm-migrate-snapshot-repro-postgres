import { Migrator } from "@mikro-orm/migrations";
import { defineConfig } from "@mikro-orm/postgresql";

import { Account, Order } from "./entity.ts";

export default defineConfig({
  dbName: "postgres",
  host: "localhost",
  port: 1001,
  user: "postgres",
  password: "password",
  entities: [Account, Order],
  extensions: [Migrator],
  migrations: {
    path: "src/migrations",
    snapshot: true,
    snapshotName: ".snapshot-postgres",
  },
});
