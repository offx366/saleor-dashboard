import Wrapper from "@test/wrapper";
import { render, screen, waitFor } from "@testing-library/react";

import { OrderCustomerConversations } from "./OrderCustomerConversations";

const mockAuthenticatedFetch = jest.fn();

jest.mock("@dashboard/legacy-sdk", (): Record<string, unknown> => {
  const actualLegacySdk: Record<string, unknown> = jest.requireActual("@dashboard/legacy-sdk");

  return {
    ...actualLegacySdk,
    createFetch:
      (): typeof fetch =>
      (...args): Promise<Response> =>
        mockAuthenticatedFetch(...args),
  };
});

jest.mock("@dashboard/components/Card", () => ({
  DashboardCard: Object.assign(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    {
      Header: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Title: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Toolbar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    },
  ),
}));

const conversationsResponse = {
  email: "customer@example.com",
  conversations: [
    {
      id: 124,
      status: "open",
      inboxId: 1,
      createdAt: 1774520603,
      lastActivityAt: 1774520603,
      chatwootUrl: "https://chat.ruslibrary.com/app/accounts/1/conversations/124",
      messages: [
        {
          id: 878,
          content: "Do you stock this product?",
          messageType: 0,
          contentType: "text",
          createdAt: 1774520603,
          senderName: "Customer Name",
          attachments: [],
        },
        {
          id: 881,
          content: "Yes, it is available.",
          messageType: 1,
          contentType: "text",
          createdAt: 1774520703,
          senderName: "Support Agent",
          attachments: [],
        },
      ],
    },
  ],
};

describe("OrderCustomerConversations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads and renders Chatwoot conversations for the order email", async () => {
    // Arrange
    mockAuthenticatedFetch.mockResolvedValue({
      ok: true,
      json: async () => conversationsResponse,
    });

    // Act
    render(
      <Wrapper>
        <OrderCustomerConversations email="customer@example.com" />
      </Wrapper>,
    );

    // Assert
    expect(await screen.findByText("Do you stock this product?")).toBeInTheDocument();
    expect(screen.getByText("Yes, it is available.")).toBeInTheDocument();
    expect(screen.getByText("Customer Name", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Support", { exact: false })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      "https://chat.ruslibrary.com/app/accounts/1/conversations/124",
    );
    expect(mockAuthenticatedFetch).toHaveBeenCalledWith(
      "https://chat.ruslibrary.com/cw/ghw-bot?email=customer%40example.com",
      expect.objectContaining({ method: "GET", signal: expect.any(AbortSignal) }),
    );
  });

  it("does not call the integration when the order has no email", () => {
    // Arrange & Act
    render(
      <Wrapper>
        <OrderCustomerConversations email={null} />
      </Wrapper>,
    );

    // Assert
    expect(screen.getByText("No customer email is available")).toBeInTheDocument();
    expect(mockAuthenticatedFetch).not.toHaveBeenCalled();
  });

  it("shows an error and retries the request", async () => {
    // Arrange
    mockAuthenticatedFetch.mockResolvedValueOnce({ ok: false, status: 502 }).mockResolvedValueOnce({
      ok: true,
      json: async () => conversationsResponse,
    });

    render(
      <Wrapper>
        <OrderCustomerConversations email="customer@example.com" />
      </Wrapper>,
    );

    await screen.findByText("Could not load customer conversations");

    // Act
    screen.getByRole("button", { name: "Try again" }).click();

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Do you stock this product?")).toBeInTheDocument();
    });
    expect(mockAuthenticatedFetch).toHaveBeenCalledTimes(2);
  });
});
