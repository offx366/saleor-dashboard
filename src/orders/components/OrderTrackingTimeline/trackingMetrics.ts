import { normalizeTrackingStatus } from "../OrderListDatagrid/tracking";
import { type TrackingSummary } from "../OrderListDatagrid/useOrderTrackingSummaries";

export interface TrackingMetrics {
  eventCount: number;
  startedAt?: Date;
  latestEventAt?: Date;
  durationMs?: number;
  delivered: boolean;
}

const parseDate = (value: string | null | undefined): Date | undefined => {
  if (!value) {
    return undefined;
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? new Date(timestamp) : undefined;
};

export const getTrackingMetrics = (
  tracking: TrackingSummary,
  now = new Date(),
): TrackingMetrics => {
  const eventDates = (tracking.events ?? [])
    .map(event => parseDate(event.time ?? event.timeUtc))
    .filter((date): date is Date => Boolean(date));
  const lastEventDate = parseDate(tracking.lastEventTime);
  const allDates = lastEventDate ? [...eventDates, lastEventDate] : eventDates;
  const timestamps = allDates.map(date => date.getTime());
  const earliestTimestamp = timestamps.length ? Math.min(...timestamps) : undefined;
  const latestTimestamp = timestamps.length ? Math.max(...timestamps) : undefined;
  const delivered = normalizeTrackingStatus(tracking.status).startsWith("delivered");
  const durationEnd = delivered ? latestTimestamp : now.getTime();
  const durationMs =
    earliestTimestamp !== undefined && durationEnd !== undefined && durationEnd > earliestTimestamp
      ? durationEnd - earliestTimestamp
      : undefined;

  return {
    eventCount: tracking.events?.length ?? 0,
    startedAt: earliestTimestamp === undefined ? undefined : new Date(earliestTimestamp),
    latestEventAt: latestTimestamp === undefined ? undefined : new Date(latestTimestamp),
    durationMs,
    delivered,
  };
};

export const getDurationParts = (
  durationMs: number,
): {
  days: number;
  hours: number;
} => {
  const totalHours = Math.max(1, Math.floor(durationMs / (60 * 60 * 1000)));

  return {
    days: Math.floor(totalHours / 24),
    hours: totalHours % 24,
  };
};
