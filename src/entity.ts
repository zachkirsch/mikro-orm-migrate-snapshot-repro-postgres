import {
  Check,
  Entity,
  Enum,
  Index,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/decorators/legacy";

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

@Entity({ tableName: "account" })
@Check({
  name: "this_is_an_absurdly_long_check_constraint_name_to_trigger_postgres_truncation",
  expression: "balance >= 0",
})
@Index({
  name: "account_data_gin",
  properties: ["data"],
  type: "gin",
})
export class Account {
  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({ type: "number" })
  balance!: number;

  @Enum({
    items: () => AccountStatus,
    nativeEnumName: "account_status",
  })
  status!: AccountStatus;

  @Property({ columnType: "geometry(point, 4326)", type: "string" })
  location!: string;

  @Property({ type: "json" })
  data!: unknown;

  @Property({ type: "Date", defaultRaw: "current_timestamp" })
  createdAt!: Date;

  @Property({
    type: "number",
    columnType: "integer",
    generated: "(coalesce(balance, 0) * 2) STORED",
  })
  doubled!: number;
}

@Entity({ tableName: "order_" })
@Unique({
  name: "order_pending_unique_ref",
  properties: ["accountId", "ref"],
  where: "status = 'PENDING'",
})
export class Order {
  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({ type: "number" })
  accountId!: number;

  @Property({ type: "string" })
  ref!: string;

  @Property({ type: "string" })
  status!: string;
}
