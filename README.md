# Luma Gifts

A mobile-first Telegram Mini App marketplace for browsing and purchasing limited digital gifts.

## Workspace

- `apps/web` — React, Vite, Tailwind CSS, React Router, and TanStack Query
- `apps/api` — NestJS, Prisma, PostgreSQL, and Telegram init-data validation
- `packages/types` — shared API contracts
- `packages/config` — shared TypeScript configuration

## Local setup

1. Copy `.env.example` to `.env` and replace the secrets.
2. Run `docker compose up -d postgres`.
3. Run `pnpm install`, `pnpm db:generate`, and `pnpm db:migrate`.
4. Run `pnpm dev`.
5. Call `POST /api/internal/gifts/sync` with `X-Internal-Api-Key` to synchronize the official Telegram catalog.

The frontend requires a real Telegram Mini App launch context. It does not ship with a fake user or mock-data mode. Outside Telegram it displays a launch instruction instead of bypassing authentication.

## Authentication

The client sends Telegram's raw `initData` string to `POST /api/auth/telegram`. The API verifies its HMAC signature and timestamp before upserting the Telegram user and returning an application JWT. `initDataUnsafe` is used only for immediate, untrusted display while authentication completes.

The JWT is retained in memory rather than browser storage. Protected data is then loaded from `/api/users/me`, `/api/balance`, `/api/home`, `/api/inventory`, and `/api/orders`.

The prototype data audit, rollout order, balance invariant, and rollback guidance are documented in [`docs/data-migration-plan.md`](docs/data-migration-plan.md).

## Telegram Gifts

Production catalog data comes from Telegram Bot API `getAvailableGifts`. `POST /api/internal/gifts/sync` upserts by `telegramGiftId`, refreshes Telegram-controlled price, supply, availability, artwork, and raw snapshot data, while preserving internal names, categories, rarity overrides, featured placement, and popularity.

`GET /api/telegram/gifts/me` calls `getUserGifts` for the authenticated Telegram ID. These live Telegram-owned gifts remain separate from `INTERNAL` inventory records. Telegram catalog purchases use `sendGift`; failed delivery restores the reserved internal balance and marks the order and purchase ledger entry failed.

The 32-item seed is disabled by default. It can only be run outside production with both `ENABLE_DEVELOPMENT_SEED=true` and `ENABLE_DEVELOPMENT_GIFT_FALLBACK=true`.

## Balance and Telegram Stars

`User.balance` is an internal marketplace balance, not the user's Telegram Stars wallet balance. It is cached on the user record and backed by an immutable `BalanceTransaction` ledger.

`POST /api/payments/stars/invoice` creates an XTR invoice link for `Telegram.WebApp.openInvoice`. The webhook validates the secret header and pre-checkout user, payload, currency, and amount. Only `successful_payment` creates the idempotent `DEPOSIT` ledger entry and updates cached balance; `telegram_payment_charge_id` and `invoice_payload` are unique.

Configure Telegram's webhook with `POST https://api.telegram.org/bot<token>/setWebhook`, point it to `/api/payments/telegram/webhook`, set `secret_token` to `TELEGRAM_WEBHOOK_SECRET`, and allow `message` plus `pre_checkout_query` updates.

Production signup bonuses are disabled. A development-only bonus requires `NODE_ENV` other than `production`, `ENABLE_DEVELOPMENT_BONUS=true`, and `DEVELOPMENT_BONUS_AMOUNT`.
