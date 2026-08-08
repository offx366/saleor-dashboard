import createDialogActionHandlers from "./dialogActionHandlers";

describe("createDialogActionHandlers", () => {
  const buildUrl = (params: Record<string, unknown>) => `/orders/1?${JSON.stringify(params)}`;

  it("preserves lineId when opening fulfillment metadata modal", () => {
    // Arrange
    const navigate = jest.fn();
    const params = { lineId: "line-1" };
    const [openModal] = createDialogActionHandlers(navigate, buildUrl, params);

    // Act
    openModal("view-fulfillment-metadata", { id: "fulfillment-1" });

    // Assert
    expect(navigate).toHaveBeenCalledWith(
      buildUrl({
        lineId: "line-1",
        id: "fulfillment-1",
        action: "view-fulfillment-metadata",
      }),
    );
  });

  it("preserves lineId when closing a modal", () => {
    // Arrange
    const navigate = jest.fn();
    const params = {
      lineId: "line-1",
      action: "edit-fulfillment",
      id: "fulfillment-1",
    };
    const [, closeModal] = createDialogActionHandlers(navigate, buildUrl, params);

    // Act
    closeModal();

    // Assert
    expect(navigate).toHaveBeenCalledWith(
      buildUrl({
        lineId: "line-1",
        action: undefined,
        id: undefined,
        ids: undefined,
      }),
      { replace: true },
    );
  });

  it("clears warehouse picker params without clearing line focus", () => {
    // Arrange
    const navigate = jest.fn();
    const params = {
      lineId: "focused-line",
      warehouseLineId: "warehouse-line",
      warehouseId: "warehouse-1",
      action: "change-warehouse",
    };
    const [, closeModal] = createDialogActionHandlers(navigate, buildUrl, params, [
      "warehouseLineId",
      "warehouseId",
    ]);

    // Act
    closeModal();

    // Assert
    expect(navigate).toHaveBeenCalledWith(
      buildUrl({
        lineId: "focused-line",
        warehouseLineId: undefined,
        warehouseId: undefined,
        action: undefined,
        id: undefined,
        ids: undefined,
      }),
      { replace: true },
    );
  });
});
