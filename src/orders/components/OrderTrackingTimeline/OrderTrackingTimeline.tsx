import { DashboardCard } from "@dashboard/components/Card";
import { Placeholder } from "@dashboard/components/Placeholder";
import { StatusDot } from "@dashboard/components/StatusDot/StatusDot";
import {
  getTrackingStatusLabel,
  getTrackingStatusTone,
} from "@dashboard/orders/components/OrderListDatagrid/tracking";
import {
  fetchOrderTrackingSummaries,
  type OrderTrackingResponse,
  type TrackingSummary,
  type TrackingTimelineEvent,
} from "@dashboard/orders/components/OrderListDatagrid/useOrderTrackingSummaries";
import { Button, Skeleton, Text } from "@saleor/macaw-ui-next";
import { ChevronDown, ChevronUp, ExternalLink, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormattedMessage, type IntlShape, useIntl } from "react-intl";

import styles from "./OrderTrackingTimeline.module.css";
import { getDurationParts, getTrackingMetrics } from "./trackingMetrics";

const PREVIEW_EVENT_COUNT = 5;

interface OrderTrackingTimelineProps {
  orderId: string;
}

const formatDateTime = (date: Date, intl: IntlShape): string =>
  `${intl.formatDate(date, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}, ${intl.formatTime(date, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

const formatDuration = (durationMs: number | undefined, intl: IntlShape): string => {
  if (durationMs === undefined) {
    return intl.formatMessage({
      id: "Ph58Wf",
      defaultMessage: "Waiting for carrier scans",
    });
  }

  const { days, hours } = getDurationParts(durationMs);

  if (days === 0) {
    return intl.formatMessage(
      {
        id: "Giy64i",
        defaultMessage: "{hours, plural, one {# hour} other {# hours}}",
      },
      { hours },
    );
  }

  return intl.formatMessage(
    {
      id: "qw+hky",
      defaultMessage:
        "{days, plural, one {# day} other {# days}} {hours, plural, =0 {} one {# hour} other {# hours}}",
    },
    { days, hours },
  );
};

const formatRelativeTime = (date: Date | undefined, intl: IntlShape): string => {
  if (!date) {
    return intl.formatMessage({
      id: "xRwqzV",
      defaultMessage: "No carrier update yet",
    });
  }

  const differenceMs = date.getTime() - Date.now();
  const absoluteDifference = Math.abs(differenceMs);

  if (absoluteDifference < 60 * 60 * 1000) {
    return intl.formatRelativeTime(Math.round(differenceMs / (60 * 1000)), "minute");
  }

  if (absoluteDifference < 24 * 60 * 60 * 1000) {
    return intl.formatRelativeTime(Math.round(differenceMs / (60 * 60 * 1000)), "hour");
  }

  return intl.formatRelativeTime(Math.round(differenceMs / (24 * 60 * 60 * 1000)), "day");
};

const getEventDate = (event: TrackingTimelineEvent): Date | undefined => {
  const value = event.time ?? event.timeUtc;

  if (!value) {
    return undefined;
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? new Date(timestamp) : undefined;
};

const getEventLocation = (event: TrackingTimelineEvent): string => {
  const parts = Array.from(
    new Set(
      [event.location, event.city, event.country].filter((value): value is string => !!value),
    ),
  );

  return parts.join(", ");
};

const getTrackingLink = (trackingNumber: string): string =>
  `https://t.17track.net/en#nums=${encodeURIComponent(trackingNumber)}`;

const TrackingItem = ({
  tracking,
  expanded,
  onToggle,
}: {
  tracking: TrackingSummary;
  expanded: boolean;
  onToggle: () => void;
}): JSX.Element => {
  const intl = useIntl();
  const metrics = getTrackingMetrics(tracking);
  const events = tracking.events ?? [];
  const visibleEvents = expanded ? events : events.slice(0, PREVIEW_EVENT_COUNT);
  const statusLabel = getTrackingStatusLabel(tracking.status, intl);
  const statusTone = getTrackingStatusTone(tracking.status);
  const durationLabel = formatDuration(metrics.durationMs, intl);
  const providerName =
    tracking.provider?.name ||
    tracking.provider?.alias ||
    intl.formatMessage({
      id: "Z1RDyy",
      defaultMessage: "Carrier not identified",
    });

  return (
    <section className={styles.trackingItem}>
      <div className={styles.trackingHeader}>
        <div className={styles.trackingIdentity}>
          <div className={styles.trackingNumberRow}>
            <Text fontWeight="bold">{tracking.trackingNumber}</Text>
            <a
              className={styles.externalLink}
              href={getTrackingLink(tracking.trackingNumber)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={14} />
              <FormattedMessage id="DillEz" defaultMessage="Open in 17TRACK" />
            </a>
          </div>
          <Text size={2} color="default2">
            {providerName}
            {tracking.provider?.country ? ` · ${tracking.provider.country}` : ""}
          </Text>
        </div>
        <div className={styles.status}>
          <StatusDot status={statusTone} />
          <Text fontWeight="bold">{statusLabel}</Text>
        </div>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <Text size={2} color="default2">
            {metrics.delivered ? (
              <FormattedMessage id="pc2Z1L" defaultMessage="Delivery time" />
            ) : (
              <FormattedMessage id="ynONSA" defaultMessage="Time in transit" />
            )}
          </Text>
          <Text fontWeight="bold">{durationLabel}</Text>
        </div>
        <div className={styles.metric}>
          <Text size={2} color="default2">
            <FormattedMessage id="knQ0du" defaultMessage="Carrier events" />
          </Text>
          <Text fontWeight="bold">{metrics.eventCount}</Text>
        </div>
        <div className={styles.metric}>
          <Text size={2} color="default2">
            <FormattedMessage id="eF+nf8" defaultMessage="Latest update" />
          </Text>
          <Text
            fontWeight="bold"
            title={metrics.latestEventAt ? formatDateTime(metrics.latestEventAt, intl) : undefined}
          >
            {formatRelativeTime(metrics.latestEventAt, intl)}
          </Text>
        </div>
        <div className={styles.metric}>
          <Text size={2} color="default2">
            <FormattedMessage id="GBPMMf" defaultMessage="Last checked" />
          </Text>
          <Text fontWeight="bold">{formatDateTime(new Date(tracking.checkedAt), intl)}</Text>
        </div>
      </div>

      {tracking.providerTrackingStopped && metrics.delivered && (
        <div className={styles.stoppedNotice}>
          <StatusDot status="success" />
          <Text size={2}>
            <FormattedMessage
              id="NR1IYH"
              defaultMessage="Delivered — automatic provider checks have stopped"
            />
          </Text>
        </div>
      )}

      {events.length ? (
        <>
          <div className={styles.timeline} data-expanded={expanded}>
            {visibleEvents.map((event, index) => {
              const eventDate = getEventDate(event);
              const location = getEventLocation(event);

              return (
                <div
                  className={styles.event}
                  key={`${event.time ?? event.timeUtc ?? "event"}-${event.description ?? index}`}
                >
                  <div className={styles.eventMarker} aria-hidden="true">
                    <span />
                  </div>
                  <div className={styles.eventTime}>
                    {eventDate ? (
                      <>
                        <Text size={2} color="default2">
                          {intl.formatDate(eventDate, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </Text>
                        <Text size={2} color="default2">
                          {intl.formatTime(eventDate, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </>
                    ) : (
                      <Text size={2} color="default2">
                        —
                      </Text>
                    )}
                  </div>
                  <div className={styles.eventDetails}>
                    <Text fontWeight={index === 0 ? "bold" : "regular"}>
                      {event.description || (
                        <FormattedMessage id="ruRGzt" defaultMessage="Carrier update" />
                      )}
                    </Text>
                    {!!location && (
                      <Text size={2} color="default2">
                        {location}
                      </Text>
                    )}
                    {(event.stage || event.subStatus) && (
                      <Text size={1} color="default2">
                        {[event.stage, event.subStatus].filter(Boolean).join(" · ")}
                      </Text>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {events.length > PREVIEW_EVENT_COUNT && (
            <Button variant="secondary" onClick={onToggle} className={styles.expandButton}>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {expanded ? (
                <FormattedMessage id="lWY4Sr" defaultMessage="Show recent events" />
              ) : (
                <FormattedMessage
                  id="5wLT96"
                  defaultMessage="Show full journey ({count} events)"
                  values={{ count: events.length }}
                />
              )}
            </Button>
          )}
        </>
      ) : (
        <div className={styles.noEvents}>
          <Text color="default2">
            {tracking.lastEventText || (
              <FormattedMessage
                id="7OUJ+4"
                defaultMessage="The carrier has not published any events yet"
              />
            )}
          </Text>
        </div>
      )}
    </section>
  );
};

export const OrderTrackingTimeline = ({ orderId }: OrderTrackingTimelineProps): JSX.Element => {
  const [data, setData] = useState<OrderTrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [expandedTrackingNumbers, setExpandedTrackingNumbers] = useState<Set<string>>(
    () => new Set(),
  );

  const loadTracking = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      setLoading(true);
      setHasError(false);

      try {
        const result = await fetchOrderTrackingSummaries({
          orderIds: [orderId],
          includeDetails: true,
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
    [orderId],
  );

  useEffect(
    function loadOrderTrackingTimeline() {
      const controller = new AbortController();

      void loadTracking(controller.signal);

      return function abortOrderTrackingTimeline(): void {
        controller.abort();
      };
    },
    [loadTracking],
  );

  const tracking = useMemo(
    () => data?.orders.find(order => order.orderId === orderId)?.tracking ?? [],
    [data, orderId],
  );
  const toggleExpanded = useCallback((trackingNumber: string): void => {
    setExpandedTrackingNumbers(current => {
      const next = new Set(current);

      if (next.has(trackingNumber)) {
        next.delete(trackingNumber);
      } else {
        next.add(trackingNumber);
      }

      return next;
    });
  }, []);

  return (
    <DashboardCard data-test-id="order-tracking-timeline">
      <DashboardCard.Header>
        <div>
          <DashboardCard.Title>
            <FormattedMessage id="mqrPth" defaultMessage="Shipment journey" />
          </DashboardCard.Title>
          <DashboardCard.Subtitle>
            <FormattedMessage
              id="snfXfZ"
              defaultMessage="Live carrier status, delivery time and the complete tracking chain"
            />
          </DashboardCard.Subtitle>
        </div>
        <DashboardCard.Toolbar>
          <Button
            variant="secondary"
            onClick={() => void loadTracking()}
            disabled={loading}
            data-test-id="refresh-order-tracking"
          >
            <RefreshCw size={16} />
            <FormattedMessage id="rELDbB" defaultMessage="Refresh" />
          </Button>
        </DashboardCard.Toolbar>
      </DashboardCard.Header>
      <DashboardCard.Content paddingBottom={6}>
        {loading && !data ? (
          <>
            <Skeleton __height="112px" __marginBottom="12px" />
            <Skeleton __height="160px" />
          </>
        ) : hasError ? (
          <div className={styles.error}>
            <Text color="critical1">
              <FormattedMessage id="3xiwF5" defaultMessage="Could not load shipment tracking" />
            </Text>
            <Button variant="secondary" onClick={() => void loadTracking()}>
              <FormattedMessage id="FazwRl" defaultMessage="Try again" />
            </Button>
          </div>
        ) : tracking.length === 0 ? (
          <Placeholder>
            <FormattedMessage
              id="+w0GCY"
              defaultMessage="This order does not have a tracking number yet"
            />
          </Placeholder>
        ) : (
          <div className={styles.trackingList}>
            {data?.providerError && (
              <div className={styles.providerWarning}>
                <Text size={2}>
                  <FormattedMessage
                    id="lmjwGx"
                    defaultMessage="The carrier is temporarily unavailable. Showing the last saved tracking data."
                  />
                </Text>
              </div>
            )}
            {tracking.map(item => (
              <TrackingItem
                key={item.trackingNumber}
                tracking={item}
                expanded={expandedTrackingNumbers.has(item.trackingNumber)}
                onToggle={() => toggleExpanded(item.trackingNumber)}
              />
            ))}
          </div>
        )}
      </DashboardCard.Content>
    </DashboardCard>
  );
};

OrderTrackingTimeline.displayName = "OrderTrackingTimeline";
