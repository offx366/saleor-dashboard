import { createFetch } from "@dashboard/legacy-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";

const ORDER_TRACKING_ENDPOINT = "https://api.ruslibrary.com/tracking/api/order-tracking-summary";

// The keyless official carrier endpoints are deliberately rate-limited. A
// one-minute refresh lets the backend advance its small legal refresh queue
// without making the browser issue repeated manual requests.
const REFRESH_INTERVAL_MS = 60 * 1000;
const authenticatedFetch = createFetch({ refreshOnUnauthorized: false });

export interface TrackingProvider {
  name?: string;
  alias?: string;
  country?: string;
}

export interface TrackingTimelineEvent {
  time?: string;
  timeUtc?: string;
  description?: string;
  location?: string;
  city?: string | null;
  country?: string | null;
  stage?: string | null;
  subStatus?: string | null;
}

export interface TrackingSummary {
  trackingNumber: string;
  status: string;
  lastEventText?: string;
  lastEventTime?: string;
  lastLocation?: string;
  checkedAt: string;
  provider?: TrackingProvider | null;
  events?: TrackingTimelineEvent[];
  providerTrackingStopped?: boolean;
}

export interface OrderTrackingSummary {
  orderId: string;
  hasTracking: boolean;
  tracking: TrackingSummary[];
}

export interface OrderTrackingResponse {
  orders: OrderTrackingSummary[];
  providerError: boolean;
}

interface UseOrderTrackingSummariesResult {
  orders: Map<string, OrderTrackingSummary>;
  loading: boolean;
  hasError: boolean;
  providerError: boolean;
}

interface FetchOrderTrackingSummariesOptions {
  orderIds: string[];
  includeDetails?: boolean;
  signal?: AbortSignal;
}

export const fetchOrderTrackingSummaries = async ({
  orderIds,
  includeDetails = false,
  signal,
}: FetchOrderTrackingSummariesOptions): Promise<OrderTrackingResponse> => {
  const response = await authenticatedFetch(ORDER_TRACKING_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderIds, includeDetails }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Order tracking request failed with ${response.status}`);
  }

  return response.json();
};

export const useOrderTrackingSummaries = (
  orderIds: string[],
  enabled: boolean,
): UseOrderTrackingSummariesResult => {
  const orderIdsKey = orderIds.join(",");
  const stableOrderIds = useMemo(() => orderIdsKey.split(",").filter(Boolean), [orderIdsKey]);
  const [data, setData] = useState<OrderTrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (!enabled || stableOrderIds.length === 0) {
        setData({ orders: [], providerError: false });
        setLoading(false);
        setHasError(false);

        return;
      }

      setLoading(true);
      setHasError(false);

      try {
        const result = await fetchOrderTrackingSummaries({
          orderIds: stableOrderIds,
          signal,
        });

        if (!signal?.aborted) {
          setData(result);
        }
      } catch {
        if (!signal?.aborted) {
          setHasError(true);
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [enabled, stableOrderIds],
  );

  useEffect(
    function loadOrderTrackingSummaries() {
      const controller = new AbortController();

      void load(controller.signal);

      const interval = window.setInterval(() => {
        void load(controller.signal);
      }, REFRESH_INTERVAL_MS);

      return function stopOrderTrackingSummaries(): void {
        controller.abort();
        window.clearInterval(interval);
      };
    },
    [load],
  );

  const orders = useMemo(
    () => new Map((data?.orders ?? []).map(order => [order.orderId, order])),
    [data],
  );

  return {
    orders,
    loading,
    hasError,
    providerError: data?.providerError ?? false,
  };
};
