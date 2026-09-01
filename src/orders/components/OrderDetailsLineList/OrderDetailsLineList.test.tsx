import { order } from "@dashboard/orders/fixtures";
import Wrapper from "@test/wrapper";
import { fireEvent, render, screen } from "@testing-library/react";

import { OrderDetailsLineList } from "./OrderDetailsLineList";

const orderFixture = order("");
const line = orderFixture.lines[0];
const discountedLine = {
  ...line,
  unitPrice: {
    ...line.unitPrice,
    gross: {
      ...line.unitPrice.gross,
      amount: line.unitPrice.gross.amount - 10,
    },
  },
};

const renderList = ({
  line: renderedLine = line,
  onOrderLineShowMetadata = jest.fn(),
  onShowLinePriceBreakdown = jest.fn(),
}: {
  line?: typeof line;
  onOrderLineShowMetadata?: jest.Mock;
  onShowLinePriceBreakdown?: jest.Mock;
} = {}): ReturnType<typeof render> =>
  render(
    <Wrapper>
      <OrderDetailsLineList
        getLineMenuItems={() => []}
        lines={[renderedLine]}
        loading={false}
        onOrderLineShowMetadata={onOrderLineShowMetadata}
        onShowLinePriceBreakdown={onShowLinePriceBreakdown}
      />
    </Wrapper>,
  );

describe("OrderDetailsLineList", () => {
  it("renders order line information without a canvas", () => {
    const { container } = renderList();

    expect(screen.getByText(line.productName)).toBeInTheDocument();
    expect(screen.getByText(`Quantity: ${line.quantity}`)).toBeInTheDocument();
    expect(screen.getByTestId("order-details-mobile-lines")).toBeInTheDocument();
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
  });

  it("keeps metadata and price breakdown actions available", () => {
    const onOrderLineShowMetadata = jest.fn();
    const onShowLinePriceBreakdown = jest.fn();

    renderList({
      line: discountedLine,
      onOrderLineShowMetadata,
      onShowLinePriceBreakdown,
    });
    fireEvent.click(screen.getByRole("button", { name: "View metadata" }));
    fireEvent.click(screen.getByRole("button", { name: "Price breakdown" }));

    expect(onOrderLineShowMetadata).toHaveBeenCalledWith(line.id);
    expect(onShowLinePriceBreakdown).toHaveBeenCalledWith(line.id);
  });
});
