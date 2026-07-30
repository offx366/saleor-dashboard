import { getCountryFlagDataUri } from "./countryFlag";

describe("getCountryFlagDataUri", () => {
  it("returns a bundled SVG data URI for a supported country", () => {
    const result = getCountryFlagDataUri("de");

    expect(result.startsWith("data:image/svg+xml;charset=utf-8,")).toBe(true);
    expect(decodeURIComponent(result)).toContain('viewBox="0 0 513 342"');
  });

  it("returns an empty string for an invalid or unsupported country code", () => {
    expect(getCountryFlagDataUri("")).toEqual("");
    expect(getCountryFlagDataUri("not-a-country")).toEqual("");
    expect(getCountryFlagDataUri("ZZ")).toEqual("");
  });
});
