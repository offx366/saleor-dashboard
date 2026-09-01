import { type OrderListQuery } from "@dashboard/graphql";
import { OrderFixture } from "@dashboard/orders/fixtures/OrderFixture";
import { type RelayToFlat } from "@dashboard/types";
import Wrapper from "@test/wrapper";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { OrderListMobile } from "./OrderListMobile";

type Order = RelayToFlat<NonNullable<OrderListQuery["orders"]>>[number];

const dispatchPointerEvent = (
  target: Element,
  type: "pointerdown" | "pointermove" | "pointerup",
  {
    pointerId,
    clientX = 0,
    clientY = 0,
  }: { pointerId: number; clientX?: number; clientY?: number },
): void => {
  const event = new Event(type, { bubbles: true, cancelable: true });

  Object.defineProperties(event, {
    clientX: { value: clientX },
    clientY: { value: clientY },
    isPrimary: { value: true },
    pointerId: { value: pointerId },
  });
  fireEvent(target, event);
};

const renderList = (onRowClick: jest.Mock): HTMLElement => {
  const order = OrderFixture.fulfilled().build() as unknown as Order;

  render(
    <Wrapper>
      <MemoryRouter>
        <OrderListMobile
          emptyText="No orders"
          onRowClick={onRowClick}
          orders={[order]}
        />
      </MemoryRouter>
    </Wrapper>,
  );

  return screen.getByRole("link");
};

describe("OrderListMobile", () => {
  it("opens the order after a tap", () => {
    const onRowClick = jest.fn();
    const link = renderList(onRowClick);

    dispatchPointerEvent(link, "pointerdown", { pointerId: 1, clientY: 100 });
    dispatchPointerEvent(link, "pointerup", { pointerId: 1, clientY: 100 });
    fireEvent.click(link);

    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it("does not open the order after a swipe", () => {
    const onRowClick = jest.fn();
    const link = renderList(onRowClick);

    dispatchPointerEvent(link, "pointerdown", { pointerId: 1, clientY: 100 });
    dispatchPointerEvent(link, "pointermove", { pointerId: 1, clientY: 120 });
    dispatchPointerEvent(link, "pointerup", { pointerId: 1, clientY: 120 });
    fireEvent.click(link);

    expect(onRowClick).not.toHaveBeenCalled();
  });
});
