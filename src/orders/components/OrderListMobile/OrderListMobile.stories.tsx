import {
  OrderChargeStatusEnum,
  type OrderListQuery,
  OrderStatus,
  PaymentChargeStatusEnum,
} from "@dashboard/graphql";
import { type RelayToFlat } from "@dashboard/types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { OrderListMobile } from "./OrderListMobile";

type Order = RelayToFlat<NonNullable<OrderListQuery["orders"]>>[number];

const sampleOrder: Order = {
  __typename: "Order",
  billingAddress: {
    __typename: "Address",
    city: "Minsk",
    cityArea: "",
    companyName: "",
    country: {
      __typename: "CountryDisplay",
      code: "BY",
      country: "Belarus",
    },
    countryArea: "",
    firstName: "Anna",
    id: "address-1",
    lastName: "Petrova",
    phone: null,
    postalCode: "220000",
    streetAddress1: "Nezavisimosti Avenue 1",
    streetAddress2: "",
  },
  channel: {
    __typename: "Channel",
    id: "channel-1",
    name: "Online Store",
  },
  chargeStatus: OrderChargeStatusEnum.FULL,
  created: "2026-08-31T10:24:00.000Z",
  events: [],
  id: "order-632",
  number: "632",
  paymentStatus: PaymentChargeStatusEnum.FULLY_CHARGED,
  shippingAddress: null,
  status: OrderStatus.UNFULFILLED,
  subtotal: {
    __typename: "TaxedMoney",
    net: {
      __typename: "Money",
      amount: 84.5,
      currency: "USD",
    },
  },
  total: {
    __typename: "TaxedMoney",
    gross: {
      __typename: "Money",
      amount: 84.5,
      currency: "USD",
    },
  },
  userEmail: "anna@example.com",
};

const orders: Order[] = [
  sampleOrder,
  {
    ...sampleOrder,
    chargeStatus: OrderChargeStatusEnum.NONE,
    created: "2026-08-30T17:45:00.000Z",
    id: "order-631",
    number: "631",
    paymentStatus: PaymentChargeStatusEnum.NOT_CHARGED,
    status: OrderStatus.FULFILLED,
    total: {
      ...sampleOrder.total,
      gross: {
        ...sampleOrder.total.gross,
        amount: 42,
      },
    },
    userEmail: "customer@example.com",
  },
];

const meta: Meta<typeof OrderListMobile> = {
  title: "Orders/OrderListMobile",
  component: OrderListMobile,
  args: {
    disabled: false,
    emptyText: "No orders found",
    onRowClick: fn(),
    orders,
    rowAnchor: (id: string) => `/orders/${id}`,
  },
  parameters: {
    chromatic: { viewports: [390] },
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof OrderListMobile>;

export const Default: Story = {};

export const Loading: Story = {
  args: { disabled: true },
};

export const Empty: Story = {
  args: { orders: [] },
};
