import { type DotStatus } from "@dashboard/components/StatusDot/StatusDot";
import { type IntlShape } from "react-intl";

import { trackingMessages } from "./messages";
import { type OrderTrackingSummary, type TrackingSummary } from "./useOrderTrackingSummaries";

interface OrderTrackingCellState {
  label: string;
  tone?: DotStatus;
}

interface GetOrderTrackingCellStateOptions {
  summary?: OrderTrackingSummary;
  loading: boolean;
  hasError: boolean;
  providerError: boolean;
  intl: IntlShape;
}

export const normalizeTrackingStatus = (status: string): string =>
  status
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

const isDelivered = (status: TrackingSummary): boolean =>
  normalizeTrackingStatus(status.status).startsWith("delivered");

const getStatusPriority = (status: TrackingSummary): number => {
  const normalized = normalizeTrackingStatus(status.status);

  if (
    normalized.startsWith("deliveryfailure") ||
    normalized.startsWith("exception") ||
    normalized.startsWith("expired")
  ) {
    return 0;
  }

  if (normalized.startsWith("outfordelivery")) {
    return 1;
  }

  if (normalized.startsWith("availableforpickup")) {
    return 2;
  }

  if (normalized.startsWith("intransit")) {
    return 3;
  }

  if (normalized.startsWith("inforeceived")) {
    return 4;
  }

  if (normalized.startsWith("notfound")) {
    return 5;
  }

  if (normalized.startsWith("delivered")) {
    return 7;
  }

  return 6;
};

export const getTrackingStatusTone = (status: string): DotStatus => {
  const normalized = normalizeTrackingStatus(status);

  if (normalized.startsWith("delivered")) {
    return "success";
  }

  if (
    normalized.startsWith("deliveryfailure") ||
    normalized.startsWith("exception") ||
    normalized.startsWith("expired")
  ) {
    return "error";
  }

  return "warning";
};

export const getTrackingStatusLabel = (status: string, intl: IntlShape): string => {
  const normalized = normalizeTrackingStatus(status);

  if (normalized.startsWith("delivered")) {
    return intl.formatMessage(trackingMessages.delivered);
  }

  if (normalized.startsWith("outfordelivery")) {
    return intl.formatMessage(trackingMessages.outForDelivery);
  }

  if (normalized.startsWith("availableforpickup")) {
    return intl.formatMessage(trackingMessages.availableForPickup);
  }

  if (normalized.startsWith("intransit")) {
    return intl.formatMessage(trackingMessages.inTransit);
  }

  if (normalized.startsWith("inforeceived")) {
    return intl.formatMessage(trackingMessages.infoReceived);
  }

  if (normalized.startsWith("deliveryfailure") || normalized.startsWith("exception")) {
    return intl.formatMessage(trackingMessages.deliveryIssue);
  }

  if (normalized.startsWith("expired")) {
    return intl.formatMessage(trackingMessages.expired);
  }

  if (normalized.startsWith("notfound")) {
    return intl.formatMessage(trackingMessages.notFound);
  }

  if (normalized.length === 0 || normalized === "unknown") {
    return intl.formatMessage(trackingMessages.unknown);
  }

  return status.replace(/([a-z])([A-Z])/g, "$1 $2");
};

const compactDetail = (value?: string): string => {
  const compact = value?.replace(/\s+/g, " ").trim() ?? "";

  if (compact.length <= 32) {
    return compact;
  }

  return `${compact.slice(0, 29)}…`;
};

export const getOrderTrackingCellState = ({
  summary,
  loading,
  hasError,
  providerError,
  intl,
}: GetOrderTrackingCellStateOptions): OrderTrackingCellState => {
  if (!summary) {
    if (loading) {
      return { label: intl.formatMessage(trackingMessages.checking) };
    }

    return {
      label: intl.formatMessage(
        hasError || providerError ? trackingMessages.unavailable : trackingMessages.noTracking,
      ),
      tone: hasError || providerError ? "error" : undefined,
    };
  }

  if (!summary.hasTracking) {
    return { label: intl.formatMessage(trackingMessages.noTracking) };
  }

  if (summary.tracking.length === 0) {
    return {
      label: intl.formatMessage(trackingMessages.unavailable),
      tone: "error",
    };
  }

  const sorted = [...summary.tracking].sort(
    (left, right) => getStatusPriority(left) - getStatusPriority(right),
  );
  const primary = sorted[0];
  const deliveredCount = summary.tracking.filter(isDelivered).length;
  const allDelivered = deliveredCount === summary.tracking.length;
  const statusLabel = getTrackingStatusLabel(primary.status, intl);

  if (allDelivered) {
    return {
      label:
        summary.tracking.length > 1
          ? `${statusLabel} · ${deliveredCount}/${summary.tracking.length}`
          : statusLabel,
      tone: "success",
    };
  }

  const detail =
    summary.tracking.length > 1
      ? deliveredCount > 0
        ? intl.formatMessage(trackingMessages.deliveredCount, {
            delivered: deliveredCount,
            total: summary.tracking.length,
          })
        : ""
      : compactDetail(primary.lastLocation || primary.lastEventText);

  return {
    label: detail ? `${statusLabel} · ${detail}` : statusLabel,
    tone: getTrackingStatusTone(primary.status),
  };
};
