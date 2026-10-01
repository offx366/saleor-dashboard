import { OrderStatus } from "@dashboard/graphql";
import Wrapper from "@test/wrapper";
import { fireEvent, render, screen } from "@testing-library/react";

import { OrderTrashDialog } from "./OrderTrashDialog";
import { canMoveOrderToTrash, isOrderInTrash, type TrashOrder } from "./utils";

const fixture: TrashOrder = {
  id: "order-730",
  number: "730",
  status: OrderStatus.CANCELED,
  billingAddress: { firstName: "Final", lastName: "Tester" },
  privateMetadata: [],
  fulfillments: [],
};

const setup = (orders = [fixture], restore = false, loading = false) => {
  const onConfirm = jest.fn();
  const onClose = jest.fn();

  render(
    <Wrapper>
      <OrderTrashDialog
        orders={orders}
        restore={restore}
        loading={loading}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    </Wrapper>,
  );

  return { onConfirm, onClose };
};

describe("safe reversible order cleanup", () => {
  it("requires the exact phrase and displays each order, not a name-based auto-delete", () => {
    // Arrange
    const { onConfirm } = setup();
    const submit = screen.getByTestId("submit");

    expect(submit).toBeDisabled();
    expect(screen.getByText("#730")).toBeInTheDocument();
    expect(
      screen.getByText(/Payments, customer details and order history are retained/),
    ).toBeInTheDocument();
    // Act // Assert
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "TRASH 2" } });
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "TRASH 1" } });
    fireEvent.click(submit);
    expect(onConfirm).toHaveBeenCalledWith("TRASH 1");
  });

  it.each([
    { ...fixture, status: OrderStatus.UNFULFILLED },
    { ...fixture, fulfillments: [{ id: "past-shipment" }] },
  ])("blocks an active or previously shipped order even with the correct phrase", order => {
    // Arrange
    const { onConfirm } = setup([fixture, { ...order, id: "second", number: "733" }]);

    // Act
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "TRASH 2" } });
    fireEvent.click(screen.getByTestId("submit"));
    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent("Only canceled orders");
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("restores retained records without requiring the customer to enter a code", () => {
    // Arrange
    const { onConfirm } = setup(
      [{ ...fixture, privateMetadata: [{ key: "ghw_order_trash", value: "true" }] }],
      true,
    );

    // Act
    fireEvent.click(screen.getByTestId("submit"));
    // Assert
    expect(onConfirm).toHaveBeenCalledWith("RESTORE 1");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("never treats a Tester name as proof and safely parses the private marker", () => {
    // Arrange // Act // Assert
    expect(canMoveOrderToTrash({ ...fixture, status: OrderStatus.FULFILLED })).toBe(false);
    expect(canMoveOrderToTrash(fixture)).toBe(true);
    for (const value of ["false", "garbage", "", "{active:true}"]) {
      expect(isOrderInTrash({ privateMetadata: [{ key: "ghw_order_trash", value }] })).toBe(false);
    }
  });
});
