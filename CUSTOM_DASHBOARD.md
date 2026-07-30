# Custom Dashboard workflow

This repository contains the production Saleor Dashboard customizations.
It started from the official `3.23.19` tag. The official Saleor repository is
configured as the `upstream` remote; no public fork is required.

## Safety model

- Source changes are tracked in Git on top of an official Saleor tag.
- Every image is tagged with the Dashboard version and the exact Git SHA.
- A dirty working tree cannot be built.
- Production promotion requires the exact image to pass the local canary.
- Promotion checks the local and public Dashboard and automatically restores
  the previous image on failure.
- `rollback` restores the last known production image without touching Saleor
  Core, PostgreSQL, orders, or customer data.

The canary listens only on `127.0.0.1:19001`. It uses the production GraphQL API
but receives no public traffic.

## Normal feature workflow

```bash
cd /home/saleor/saleor-dashboard-custom
git switch custom/3.23
git switch -c feature/order-columns

# Make the Dashboard change, then follow the repository checks:
pnpm run lint
pnpm run check-types
pnpm run test:quiet path/to/relevant.test.ts

git add <changed-files>
git commit -m "Add order list columns"

ops/dashboardctl build
ops/dashboardctl canary
ops/dashboardctl promote
```

Inspect the current state:

```bash
ops/dashboardctl status
```

Immediately restore the previous production image:

```bash
ops/dashboardctl rollback
```

For a local browser, tunnel the canary port:

```bash
ssh -L 19001:127.0.0.1:19001 <server>
```

Then open `http://localhost:19001/`.

## Customer conversations integration

The order details sidebar loads public incoming and outgoing messages for the
order email from the GlobalHealingWeb Chatwoot inbox and matching messages from
the business iCloud mailbox. The browser never receives the Chatwoot API token
or the iCloud credential. It calls the existing GlobalHealingWeb bot endpoint,
which validates the active Saleor staff token and requires `MANAGE_ORDERS`
before querying either source.

Dashboard component:

```text
src/orders/components/OrderCustomerConversations/
```

Server-side proxy:

```text
/home/saleor/saleor-platform/chatwood/globalhealingweb_bot/server.mjs
```

Inbound mail for `info@globalhealingweb.com` and
`support@globalhealingweb.com` is routed to iCloud. The proxy performs
read-only IMAP searches for the exact order email and filters inbound messages
to those business recipients. It does not import or modify the rest of the
mailbox. The app-specific password is mounted from
`/home/saleor/.secrets/ghw_icloud_app_password` as a Docker secret and must
never be committed to Git.

Brevo remains the SMTP transport for outgoing transactional mail; its delivery
events are not treated as customer-authored messages.

## Updating from Saleor

Fetch the official tags and create an upgrade branch:

```bash
git fetch upstream --tags
git switch custom/3.23
git switch -c upgrade/dashboard-3.23.x
git rebase 3.23.x
```

Resolve only the small custom commits, run the same checks, build a canary, and
promote it. After validation, fast-forward `custom/3.23` to the tested upgrade
branch.

Do not delete production or rollback images until a newer image has been stable
and its predecessor is no longer needed.
