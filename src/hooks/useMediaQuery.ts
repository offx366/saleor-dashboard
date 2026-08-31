import { useCallback, useSyncExternalStore } from "react";

const getMediaQueryList = (query: string): MediaQueryList | null => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }

  return window.matchMedia(query);
};

export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onStoreChange: () => void): (() => void) => {
      const mediaQueryList = getMediaQueryList(query);

      if (!mediaQueryList) {
        return () => undefined;
      }

      if (typeof mediaQueryList.addEventListener === "function") {
        mediaQueryList.addEventListener("change", onStoreChange);

        return () => mediaQueryList.removeEventListener("change", onStoreChange);
      }

      mediaQueryList.addListener(onStoreChange);

      return () => mediaQueryList.removeListener(onStoreChange);
    },
    [query],
  );
  const getSnapshot = useCallback(
    (): boolean => getMediaQueryList(query)?.matches ?? false,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
};
