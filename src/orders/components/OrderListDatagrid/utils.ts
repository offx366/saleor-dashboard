// @ts-strict-ignore
import { type OrderListQuery } from "@dashboard/graphql";
import { OrderListUrlSortField } from "@dashboard/orders/urls";
import { type RelayToFlat } from "@dashboard/types";

export function getOrdersRowsLength(
  orders?: RelayToFlat<OrderListQuery["orders"]>,
  loading?: boolean,
) {
  if (loading) {
    return 1;
  }

  if (orders?.length) {
    return orders.length;
  }

  return 0;
}

export function getColumnNameAndId(column: string): {
  columnName: OrderListUrlSortField;
  columnId?: string;
} {
  if (column.includes(":")) {
    const [columnName, columnId] = column.split(":");

    return {
      columnName: columnName as OrderListUrlSortField,
      columnId,
    };
  }

  return {
    columnName: column as OrderListUrlSortField,
  };
}

export function canBeSorted(sort: OrderListUrlSortField) {
  switch (sort) {
    case OrderListUrlSortField.number:
    case OrderListUrlSortField.date:
    case OrderListUrlSortField.customer:
    case OrderListUrlSortField.payment:
    case OrderListUrlSortField.fulfillment:
      return true;
    default:
      return false;
  }
}

const NET_COLUMN_ID = "net";
const TOTAL_COLUMN_ID = "total";
const CHANNEL_COLUMN_ID = "channel";
const TRACKING_COLUMN_ID = "tracking";

export const oldDefaultOrderListColumns = [
  "number",
  "date",
  "customer",
  "payment",
  "status",
  "net",
  "total",
  "channel",
];

export const defaultOrderListColumnsWithTracking = [
  "number",
  "date",
  "customer",
  "payment",
  "status",
  "net",
  "total",
  "channel",
  "tracking",
];

export const shouldMigrateOrderListColumns = (columns: string[] | undefined): boolean =>
  Boolean(columns?.length && !columns.includes(TRACKING_COLUMN_ID));

export const getOrderListColumns = (columns: string[] | undefined): string[] | undefined =>
  columns
    ? orderOrderListColumns(
        shouldMigrateOrderListColumns(columns) ? [...columns, TRACKING_COLUMN_ID] : columns,
      )
    : columns;

/**
 * Column picker prepends newly toggled columns. Keep "net" immediately before
 * "total" (or before "channel" when total is hidden).
 */
export function orderOrderListColumns(columns: string[]): string[] {
  const hasTracking = columns.includes(TRACKING_COLUMN_ID);
  let orderedColumns = columns.filter(columnId => columnId !== TRACKING_COLUMN_ID);

  if (!orderedColumns.includes(NET_COLUMN_ID)) {
    return hasTracking ? [...orderedColumns, TRACKING_COLUMN_ID] : orderedColumns;
  }

  const withoutNet = orderedColumns.filter(columnId => columnId !== NET_COLUMN_ID);
  const insertBeforeIndex = withoutNet.includes(TOTAL_COLUMN_ID)
    ? withoutNet.indexOf(TOTAL_COLUMN_ID)
    : withoutNet.includes(CHANNEL_COLUMN_ID)
      ? withoutNet.indexOf(CHANNEL_COLUMN_ID)
      : withoutNet.length;

  orderedColumns = [
    ...withoutNet.slice(0, insertBeforeIndex),
    NET_COLUMN_ID,
    ...withoutNet.slice(insertBeforeIndex),
  ];

  return hasTracking ? [...orderedColumns, TRACKING_COLUMN_ID] : orderedColumns;
}
