const RELOAD_MARKER = "saleor-dashboard:stale-chunk-reload";
const RELOAD_COOLDOWN_MS = 60_000;

interface RecoveryDependencies {
  now: () => number;
  readMarker: () => string | null;
  writeMarker: (value: string) => void;
  reload: () => void;
}

const browserDependencies: RecoveryDependencies = {
  now: () => Date.now(),
  readMarker: () => window.sessionStorage.getItem(RELOAD_MARKER),
  writeMarker: value => window.sessionStorage.setItem(RELOAD_MARKER, value),
  reload: () => window.location.reload(),
};

export const recoverFromStaleChunk = (
  event: Event,
  dependencies: RecoveryDependencies = browserDependencies,
): boolean => {
  const now = dependencies.now();
  const lastReloadAt = Number(dependencies.readMarker());

  if (Number.isFinite(lastReloadAt) && now - lastReloadAt < RELOAD_COOLDOWN_MS) {
    return false;
  }

  event.preventDefault();
  dependencies.writeMarker(String(now));
  dependencies.reload();

  return true;
};

export const installStaleChunkRecovery = (): void => {
  window.addEventListener("vite:preloadError", recoverFromStaleChunk);
};
