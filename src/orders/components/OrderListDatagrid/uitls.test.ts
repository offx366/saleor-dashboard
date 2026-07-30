import { type OrderListQuery } from "@dashboard/graphql";
import { OrderListUrlSortField } from "@dashboard/orders/urls";
import { type RelayToFlat } from "@dashboard/types";

import {
  canBeSorted,
  defaultOrderListColumnsWithTracking,
  getColumnNameAndId,
  getOrderListColumns,
  getOrdersRowsLength,
  oldDefaultOrderListColumns,
  orderOrderListColumns,
  shouldMigrateOrderListColumns,
} from "./utils";

describe("OrderListDatagrid utils", () => {
  describe("getOrdersRowsLength", () => {
    it("should return 1 when loading", () => {
      // Arrange & Act
      const rowLength = getOrdersRowsLength([], true);

      // Asset
      expect(rowLength).toBe(1);
    });
    it("should return orders length", () => {
      type NonNullQuery = Exclude<OrderListQuery["orders"], null>;

      // Arrange & Act
      const rowLength = getOrdersRowsLength(
        [{} as RelayToFlat<NonNullQuery>[number], {} as RelayToFlat<NonNullQuery>[number]],
        false,
      );

      // Asset
      expect(rowLength).toBe(2);
    });
    it("should return 0 when no orders and no loading", () => {
      // Arrange & Act
      const rowLength = getOrdersRowsLength([], false);

      // Asset
      expect(rowLength).toBe(0);
    });
  });
  describe("getColumnNameAndId", () => {
    it("should return column name with id when column name included colon", () => {
      // Arrange & Act
      const rowLength = getColumnNameAndId("attributes:123");

      // Asset
      expect(rowLength).toEqual({
        columnName: "attributes",
        columnId: "123",
      });
    });
    it("should return column name whem column name without colon", () => {
      // Arrange & Act
      const rowLength = getColumnNameAndId("test123");

      // Asset
      expect(rowLength).toEqual({
        columnName: "test123",
      });
    });
  });
  describe("canBeSorted", () => {
    it.each([
      OrderListUrlSortField.number,
      OrderListUrlSortField.date,
      OrderListUrlSortField.customer,
      OrderListUrlSortField.payment,
      OrderListUrlSortField.fulfillment,
    ])(`should return true when sortable field %s`, sortField => {
      expect(canBeSorted(sortField)).toBe(true);
    });
    it("should return false when not sortable field", () => {
      expect(canBeSorted(OrderListUrlSortField.total)).toBe(false);
      expect(canBeSorted(OrderListUrlSortField.rank)).toBe(false);
    });
  });
  describe("orderOrderListColumns", () => {
    it("places net immediately before total when toggled on", () => {
      // Arrange
      const columns = [
        "net",
        "number",
        "date",
        "customer",
        "payment",
        "status",
        "total",
        "channel",
      ];

      // Act
      const result = orderOrderListColumns(columns);

      // Assert
      expect(result).toEqual([
        "number",
        "date",
        "customer",
        "payment",
        "status",
        "net",
        "total",
        "channel",
      ]);
    });

    it("places net before channel when total is hidden", () => {
      // Arrange
      const columns = ["net", "number", "date", "status", "channel"];

      // Act
      const result = orderOrderListColumns(columns);

      // Assert
      expect(result).toEqual(["number", "date", "status", "net", "channel"]);
    });

    it("returns columns unchanged when net is not selected", () => {
      // Arrange
      const columns = ["number", "date", "total", "channel"];

      // Act
      const result = orderOrderListColumns(columns);

      // Assert
      expect(result).toEqual(columns);
    });

    it("places tracking immediately after customer so it is visible without scrolling", () => {
      // Arrange
      const columns = ["tracking", "number", "date", "customer", "status", "net", "total"];

      // Act
      const result = orderOrderListColumns(columns);

      // Assert
      expect(result).toEqual(["number", "date", "customer", "tracking", "status", "net", "total"]);
    });
  });

  describe("tracking column migration", () => {
    it("adds tracking to the old default order columns", () => {
      // Arrange & Act
      const shouldMigrate = shouldMigrateOrderListColumns(oldDefaultOrderListColumns);
      const columns = getOrderListColumns(oldDefaultOrderListColumns);

      // Assert
      expect(shouldMigrate).toBe(true);
      expect(columns).toEqual(defaultOrderListColumnsWithTracking);
    });

    it("adds tracking to a customized column list", () => {
      // Arrange
      const customColumns = ["number", "customer", "total"];

      // Act & Assert
      expect(shouldMigrateOrderListColumns(customColumns)).toBe(true);
      expect(getOrderListColumns(customColumns)).toEqual([
        "number",
        "customer",
        "tracking",
        "total",
      ]);
    });

    it("does not change columns after tracking has been added", () => {
      // Arrange
      const columnsWithTracking = ["number", "customer", "tracking", "total"];

      // Act & Assert
      expect(shouldMigrateOrderListColumns(columnsWithTracking)).toBe(false);
      expect(getOrderListColumns(columnsWithTracking)).toBe(columnsWithTracking);
    });
  });
});
