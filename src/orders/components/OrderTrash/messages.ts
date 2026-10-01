import { defineMessages } from "react-intl";

export const trashMessages = defineMessages({
  trash: { id: "j/I5tV", defaultMessage: "Trash" },
  allOrders: { id: "lNZuWl", defaultMessage: "All orders" },
  move: { id: "7igv6p", defaultMessage: "Move to Trash" },
  restore: { id: "ylkuVn", defaultMessage: "Restore orders" },
  selectCanceled: { id: "V01h1F", defaultMessage: "Select canceled on this page" },
  preserved: {
    id: "5N+iI9",
    defaultMessage:
      "This only removes orders from the working list. Payments, customer details and order history are retained. You can restore orders from Trash. No refund, cancellation or customer email will be triggered.",
  },
  blocked: {
    id: "s+k2+3",
    defaultMessage:
      "Only canceled orders without shipment history can be moved to Trash. Remove other orders from the selection; cancel an active order separately if appropriate.",
  },
  confirm: {
    id: "uM9R+U",
    defaultMessage: "Type {phrase} to confirm these {count} selected orders.",
  },
  select: { id: "ewQhoj", defaultMessage: "Select order #{number}" },
  selected: { id: "NKPfmm", defaultMessage: "{count} selected" },
  limit: { id: "oCATZb", defaultMessage: "Select at most 50 orders per operation." },
  success: {
    id: "m3v4VZ",
    defaultMessage: "Selected orders moved to Trash. All records retained.",
  },
  restored: {
    id: "nTQ7ix",
    defaultMessage: "Selected orders restored to the working list.",
  },
  uncertain: {
    id: "1FjohC",
    defaultMessage: "The result could not be confirmed. Refresh the list before trying again.",
  },
  trashHint: {
    id: "b6S3hZ",
    defaultMessage:
      "Trash is reversible. These orders are hidden from the working list; their status and financial records have not changed.",
  },
});
