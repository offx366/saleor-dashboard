import { OrderStatus } from "@dashboard/graphql";

export interface TrashOrder {
  id: string;
  number: string;
  status: OrderStatus;
  userEmail?: string | null;
  billingAddress?: { firstName: string; lastName: string } | null;
  fulfillments: Array<{ id: string }>;
  privateMetadata: Array<{ key: string; value: string }>;
}

export const isOrderInTrash = (order: Pick<TrashOrder, "privateMetadata">): boolean => {
  const value = order.privateMetadata.find(item => item.key === "ghw_order_trash")?.value;

  return value === "true";
};

export const canMoveOrderToTrash = (order: TrashOrder): boolean =>
  order.status === OrderStatus.CANCELED &&
  order.fulfillments.length === 0 &&
  !isOrderInTrash(order);

export const getTrashConfirmation = (count: number, restore: boolean): string =>
  `${restore ? "RESTORE" : "TRASH"} ${count}`;
