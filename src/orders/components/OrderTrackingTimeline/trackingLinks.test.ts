import { type TrackingSummary } from "../OrderListDatagrid/useOrderTrackingSummaries";
import {
  getAlternativeTrackingLink,
  getOfficialTrackingLink,
} from "./trackingLinks";

describe("tracking links", () => {
  it("uses Belpost for BY postal tracking numbers even when provider details are missing", () => {
    const tracking = {
      trackingNumber: "LD000595477BY",
      status: "InTransit",
      checkedAt: "2026-07-30T18:40:03.702Z",
    } satisfies TrackingSummary;

    expect(getOfficialTrackingLink(tracking)).toEqual({
      label: "Belpost",
      url: "https://belpost.by/Otsleditotpravleniye?number=LD000595477BY",
    });
  });

  it("uses a recognized carrier official tracking page", () => {
    const tracking = {
      trackingNumber: "AA123456789GB",
      status: "InTransit",
      checkedAt: "2026-07-30T18:40:03.702Z",
      provider: { name: "Royal Mail", country: "GB" },
    } satisfies TrackingSummary;

    expect(getOfficialTrackingLink(tracking)).toEqual({
      label: "Royal Mail",
      url: "https://www.royalmail.com/track-your-item?tLabels=AA123456789GB",
    });
  });

  it("always provides an independent alternative tracker", () => {
    expect(getAlternativeTrackingLink(" LD000595477BY ")).toEqual({
      label: "ParcelsApp",
      url: "https://parcelsapp.com/en/tracking/LD000595477BY",
    });
  });
});
