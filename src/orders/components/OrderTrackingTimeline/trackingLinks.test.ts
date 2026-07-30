import { type TrackingSummary } from "../OrderListDatagrid/useOrderTrackingSummaries";
import {
  getAlternativeTrackingLink,
  getOfficialTrackingLink,
  getOfficialTrackingLinks,
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

  it("adds USPS as an official destination carrier for United States orders", () => {
    const tracking = {
      trackingNumber: "LD000595477BY",
      status: "InTransit",
      checkedAt: "2026-07-30T18:40:03.702Z",
    } satisfies TrackingSummary;

    expect(getOfficialTrackingLinks(tracking, "US")).toEqual([
      {
        label: "Belpost",
        url: "https://belpost.by/Otsleditotpravleniye?number=LD000595477BY",
      },
      {
        label: "USPS",
        url: "https://tools.usps.com/go/TrackConfirmAction?tLabels=LD000595477BY",
      },
    ]);
  });

  it("does not add USPS for a non-US destination", () => {
    const tracking = {
      trackingNumber: "LD000595477BY",
      status: "InTransit",
      checkedAt: "2026-07-30T18:40:03.702Z",
    } satisfies TrackingSummary;

    expect(getOfficialTrackingLinks(tracking, "DE")).toEqual([
      {
        label: "Belpost",
        url: "https://belpost.by/Otsleditotpravleniye?number=LD000595477BY",
      },
    ]);
  });

  it("does not duplicate USPS when it is already the primary carrier", () => {
    const tracking = {
      trackingNumber: "9400111899223856928499",
      status: "InTransit",
      checkedAt: "2026-07-30T18:40:03.702Z",
      provider: { name: "USPS", country: "US" },
    } satisfies TrackingSummary;

    expect(getOfficialTrackingLinks(tracking, "us")).toEqual([
      {
        label: "USPS",
        url: "https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899223856928499",
      },
    ]);
  });
});
