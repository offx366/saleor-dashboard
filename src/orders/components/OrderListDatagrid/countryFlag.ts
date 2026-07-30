import * as countryFlagSvg from "country-flag-icons/string/3x2";

const flags = countryFlagSvg as Record<string, string | undefined>;
const dataUriCache = new Map<string, string>();

export const getCountryFlagDataUri = (countryCode: string): string => {
  const normalizedCode = countryCode.trim().toUpperCase().replaceAll("-", "_");

  if (!/^[A-Z]{2}(?:_[A-Z]{2,3})?$/.test(normalizedCode)) {
    return "";
  }

  const cached = dataUriCache.get(normalizedCode);

  if (cached) {
    return cached;
  }

  const svg = flags[normalizedCode];

  if (!svg) {
    return "";
  }

  const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  dataUriCache.set(normalizedCode, dataUri);

  return dataUri;
};
