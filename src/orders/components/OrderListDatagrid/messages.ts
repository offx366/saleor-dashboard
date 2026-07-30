import { defineMessages } from "react-intl";

export const messages = defineMessages({
  emptyText: {
    id: "RlfqSV",
    defaultMessage: "No orders found",
  },
  addOrder: {
    id: "uoKAmI",
    defaultMessage: "Add new order",
  },
  editOrder: {
    defaultMessage: "Edit order",
    id: "lwjzVj",
  },
  orders: {
    defaultMessage: "Order",
    id: "XPruqs",
  },
});

export const columnsMessages = defineMessages({
  number: {
    id: "kFkPWB",
    defaultMessage: "Number",
  },
  date: {
    id: "P7PLVj",
    defaultMessage: "Date",
  },
  customer: {
    id: "hkENym",
    defaultMessage: "Customer",
  },
  payment: {
    id: "NmK6zy",
    defaultMessage: "Payment",
  },
  status: {
    id: "NWxomz",
    defaultMessage: "Fulfillment status",
  },
  tracking: {
    id: "WKITZr",
    defaultMessage: "Tracking status",
  },
  net: {
    id: "rU2b3o",
    defaultMessage: "Net",
    description: "orders list column: net product value (excludes tax and shipping)",
  },
  total: {
    id: "MJ2jZQ",
    defaultMessage: "Total",
  },
  channel: {
    defaultMessage: "Channel",
    id: "KeO51o",
  },
});

export const trackingMessages = defineMessages({
  checking: {
    id: "PfxzLv",
    defaultMessage: "Checking…",
  },
  noTracking: {
    id: "5Rkpro",
    defaultMessage: "No tracking",
  },
  unavailable: {
    id: "N4uOoP",
    defaultMessage: "Tracking unavailable",
  },
  delivered: {
    id: "DMqnF4",
    defaultMessage: "Delivered",
  },
  inTransit: {
    id: "oLBci1",
    defaultMessage: "In transit",
  },
  outForDelivery: {
    id: "UdVzmc",
    defaultMessage: "Out for delivery",
  },
  availableForPickup: {
    id: "7Y9/BQ",
    defaultMessage: "Ready for pickup",
  },
  infoReceived: {
    id: "yNSJTr",
    defaultMessage: "Label created",
  },
  deliveryIssue: {
    id: "8uZ38U",
    defaultMessage: "Delivery issue",
  },
  expired: {
    id: "HCeRP3",
    defaultMessage: "Tracking expired",
  },
  notFound: {
    id: "TThIOM",
    defaultMessage: "Not found",
  },
  unknown: {
    id: "5jeq8P",
    defaultMessage: "Unknown",
  },
  deliveredCount: {
    id: "Cr7DpP",
    defaultMessage: "{delivered}/{total} delivered",
  },
});
