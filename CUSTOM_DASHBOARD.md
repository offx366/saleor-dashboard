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

The canary listens only on `127.0.0.1:9001`. It uses the production GraphQL API
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
ssh -L 9001:127.0.0.1:9001 <server>
```

Then open `http://localhost:9001/`.

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
