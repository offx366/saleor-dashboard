# Reversible order Trash

Canceled orders with no fulfillment history can be removed from the working
list with **Move to Trash**, after reviewing exact order numbers and typing
`TRASH N`. Select individual rows (desktop/mobile), or **Select canceled on
this page**. The selection never extends to another page.

**Trash** opens a separate server-paginated list. **Restore orders** returns
selected records to the working list. A single-order action is also available
on eligible order details. Names such as “Tester” do not authorize cleanup.

This is reversible removal, not permanent database deletion. It preserves
payments, transactions, customer details, status, order lines and photos. It
does not cancel, refund, adjust inventory or send customer email. An audit
note records the staff action. There is deliberately no “empty Trash” button.

The API requires an active staff session with MANAGE_ORDERS, enforces channel
access, locks current rows and validates all selected orders before writing.
Only private metadata and the staff audit note change. Maximum: 50 orders.
The whole transaction rolls back if any order fails validation. Application
tokens, including Hermes MCP credentials, cannot invoke this UI mutation.

API patch and checks: `/home/saleor/saleor-platform/ops/order-trash-core/`.
Layer on the currently privacy-protected Saleor API; never remove tracking
privacy as part of a release or rollback. No database migration is required.
