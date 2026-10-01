import { OrderStatus } from "@dashboard/graphql";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OrderTrashDialog } from "./OrderTrashDialog";

const meta: Meta<typeof OrderTrashDialog> = {
  title: "Orders/Trash confirmation",
  component: OrderTrashDialog,
};

export default meta;
type Story = StoryObj<typeof OrderTrashDialog>;

export const CanceledOrders: Story = {
  args: {
    orders: [
      {
        id: "test",
        number: "730",
        status: OrderStatus.CANCELED,
        fulfillments: [],
        privateMetadata: [],
        billingAddress: { firstName: "Final", lastName: "Tester" },
      },
    ],
    restore: false,
    loading: false,
    onClose: () => undefined,
    onConfirm: () => undefined,
  },
};
