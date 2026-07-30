import { createFetch } from "@dashboard/legacy-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";

const ORDER_TRACKING_ENDPOINT = "https://api.ruslibrary.com/tracking/api/order-tracking-summary";
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const authenticatedFetch = createFetch({ refreshOnUnauthorized: false });

export interface TrackingSummary {
  trackingNumber: string;
  status: string;
  lastEventText?: string;
  lastEventTime?: string;
  lastLocation?: string;
  checkedAt: string;
}

export interface OrderTrackingSummary {
  orderId: string;
  hasTracking: boolean;
  tracking: TrackingSummary[];
}

interface OrderTrackingResponse {
  orders: OrderTrackingSummary[];
  providerError: boolean;
}

interface UseOrderTrackingSummariesResult {
  orders: Map<string, OrderTrackingSummary>;
  loading: boolean;
  hasError: boolean;
  providerError: boolean;
}

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
        const response = await authenticatedFetch(ORDER_TRACKING_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderIds: stableOrderIds }),
          signal,
        });

        if (!response.ok) {
          throw new Error(`Order tracking request failed with ${response.status}`);
        }

        const result: OrderTrackingResponse = await response.json();

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
