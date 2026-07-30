import { type TrackingSummary } from "../OrderListDatagrid/useOrderTrackingSummaries";

export interface TrackingLink {
  label: string;
  url: string;
}

const normalizedProviderName = (tracking: TrackingSummary): string =>
  [tracking.provider?.name, tracking.provider?.alias]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export const getOfficialTrackingLink = (
  tracking: TrackingSummary,
): TrackingLink | undefined => {
  const trackingNumber = tracking.trackingNumber.trim();
  const encodedTrackingNumber = encodeURIComponent(trackingNumber);
  const providerName = normalizedProviderName(tracking);

  if (
    trackingNumber.toUpperCase().endsWith("BY") ||
    tracking.provider?.country?.toUpperCase() === "BY" ||
    providerName.includes("belpost")
  ) {
    return {
      label: "Belpost",
      url: `https://belpost.by/Otsleditotpravleniye?number=${encodedTrackingNumber}`,
    };
  }

  if (providerName.includes("royal mail")) {
    return {
      label: "Royal Mail",
      url: `https://www.royalmail.com/track-your-item?tLabels=${encodedTrackingNumber}`,
    };
  }

  if (
    providerName.includes("usps") ||
    providerName.includes("united states postal")
  ) {
    return {
      label: "USPS",
      url: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodedTrackingNumber}`,
    };
  }

  return undefined;
};

const getUspsTrackingLink = (trackingNumber: string): TrackingLink => ({
  label: "USPS",
  url: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber.trim())}`,
});

export const getOfficialTrackingLinks = (
  tracking: TrackingSummary,
  destinationCountryCode?: string,
): TrackingLink[] => {
  const primaryLink = getOfficialTrackingLink(tracking);
  const links = primaryLink ? [primaryLink] : [];
  const isUnitedStatesDestination =
    destinationCountryCode?.trim().toUpperCase() === "US";

  if (
    isUnitedStatesDestination &&
    !links.some((link) => link.label === "USPS")
  ) {
    links.push(getUspsTrackingLink(tracking.trackingNumber));
  }

  return links;
};

export const getAlternativeTrackingLink = (
  trackingNumber: string,
): TrackingLink => ({
  label: "ParcelsApp",
  url: `https://parcelsapp.com/en/tracking/${encodeURIComponent(trackingNumber.trim())}`,
});
