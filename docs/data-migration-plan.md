# Prototype-to-production data migration

## Audit result

The prototype previously sourced its marketplace state from frontend fixtures: eight static gifts, two inventory items, two orders, a fake Telegram profile, a hardcoded balance, and locally defined home banners/categories. The client had no authenticated connections for profile, balance, home, inventory, or orders, and buying a gift only changed component state.

The original database covered users, gifts, inventory items, and orders, but it did not model categories, promotional banners, balance ledger entries, an inventory item's originating order, or an order's balance debit.

## Migration sequence

1. Create `Category`, `Banner`, and `BalanceTransaction` tables and their enums/indexes.
2. Insert a temporary default category, backfill every existing gift, and then make `Gift.categoryId` required.
3. Add gift merchandising fields (`featured` and `popularity`).
4. Link `InventoryItem` and `BalanceTransaction` to their originating `Order` with unique optional relations.
5. Deploy the API before the frontend so all authenticated data endpoints are available.
6. Add `GiftSource`, Telegram source identifiers/snapshots, and `StarsPayment` without rewriting existing rows; all pre-existing gifts, orders, and inventory are backfilled as `INTERNAL`.
7. Synchronize `TELEGRAM` gifts by their official Telegram gift ID. Keep the seed as an explicitly enabled non-production fallback only.
8. Configure the signed Telegram webhook and verify pre-checkout, `successful_payment`, ledger idempotency, catalog reads, `sendGift`, and live Telegram-owned inventory.

## Balance invariant

`User.balance` is a transactionally maintained internal marketplace read cache; it is not Telegram's Stars wallet balance. Every completed monetary change also creates a `BalanceTransaction`. A Stars deposit is credited only from a validated `successful_payment` webhook and is uniquely linked to `StarsPayment`. Telegram-owned gifts are never copied into `InventoryItem`; mappings to synchronized catalog rows are returned explicitly.

## Deployment commands

```bash
docker compose up -d postgres
pnpm db:generate
pnpm --filter @gifts/api exec prisma migrate deploy
pnpm build
```

Use production secrets for `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `INTERNAL_API_KEY`, `JWT_SECRET`, and `ADMIN_TELEGRAM_IDS`. Do not place them in committed environment files. After deployment, configure Telegram's webhook and call the internal gift synchronization endpoint.

## Rollback notes

The migration is additive except for making `Gift.categoryId` required. Roll back the application first. Preserve `BalanceTransaction` and order/inventory links for financial audit history; do not drop them as an operational rollback. If a schema rollback is unavoidable, take a database backup and export the ledger before applying a separately reviewed down migration.
