import { type TrackingSummary } from "../OrderListDatagrid/useOrderTrackingSummaries";
import { getDurationParts, getTrackingMetrics } from "./trackingMetrics";

describe("trackingMetrics", () => {
  it("calculates completed delivery time from the first to last carrier event", () => {
    // Arrange
    const tracking: TrackingSummary = {
      trackingNumber: "TRACK-1",
      status: "Delivered",
      checkedAt: "2026-07-30T12:00:00Z",
      events: [
        { time: "2026-07-30T10:00:00Z", description: "Delivered" },
        { time: "2026-07-27T08:00:00Z", description: "Accepted" },
      ],
    };

    // Act
    const metrics = getTrackingMetrics(tracking, new Date("2026-08-10T00:00:00Z"));

    // Assert
    expect(metrics.delivered).toBe(true);
    expect(metrics.eventCount).toBe(2);
    expect(metrics.startedAt?.toISOString()).toBe("2026-07-27T08:00:00.000Z");
    expect(metrics.latestEventAt?.toISOString()).toBe("2026-07-30T10:00:00.000Z");
    expect(metrics.durationMs).toBe(3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);
  });

  it("calculates active transit time up to now", () => {
    // Arrange
    const tracking: TrackingSummary = {
      trackingNumber: "TRACK-2",
      status: "InTransit",
      checkedAt: "2026-07-30T12:00:00Z",
      events: [{ time: "2026-07-28T06:00:00Z", description: "Accepted" }],
    };

    // Act
    const metrics = getTrackingMetrics(tracking, new Date("2026-07-30T12:00:00Z"));

    // Assert
    expect(metrics.delivered).toBe(false);
    expect(metrics.durationMs).toBe(54 * 60 * 60 * 1000);
  });

  it("returns human-sized day and hour parts", () => {
    // Arrange & Act
    const duration = getDurationParts(50 * 60 * 60 * 1000);

    // Assert
    expect(duration).toEqual({ days: 2, hours: 2 });
  });
});
