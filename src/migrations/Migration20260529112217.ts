import { Migration } from '@mikro-orm/migrations';

export class Migration20260529112217 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create type "account_status" as enum ('ACTIVE', 'ARCHIVED');`);
    this.addSql(`create table "account" ("id" serial primary key, "balance" int not null, "status" "account_status" not null, "location" geometry(point, 4326) not null, "data" jsonb not null, "created_at" timestamptz not null default current_timestamp, "doubled" integer generated always as (coalesce(balance, 0) * 2) STORED not null);`);
    this.addSql(`create index "account_data_gin" on "account" ("data");`);
    this.addSql(`alter table "account" add constraint "this_is_an_absurdly_long_check_constraint_name_to_trigger_postgres_truncation" check (balance >= 0);`);

    this.addSql(`create table "order_" ("id" serial primary key, "account_id" int not null, "ref" varchar(255) not null, "status" varchar(255) not null);`);
    this.addSql(`create unique index "order_pending_unique_ref" on "order_" ("account_id", "ref") where status = 'PENDING';`);
  }

}
