import { recoverFromStaleChunk } from "./staleChunkRecovery";

const createDependencies = (lastReloadAt: string | null, now: number) => ({
  now: jest.fn(() => now),
  readMarker: jest.fn(() => lastReloadAt),
  writeMarker: jest.fn(),
  reload: jest.fn(),
});

describe("recoverFromStaleChunk", () => {
  it("reloads once when a stale Vite chunk cannot be loaded", () => {
    // Arrange
    const event = new Event("vite:preloadError", { cancelable: true });
    const dependencies = createDependencies(null, 100_000);

    // Act
    const recovered = recoverFromStaleChunk(event, dependencies);

    // Assert
    expect(recovered).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(dependencies.writeMarker).toHaveBeenCalledWith("100000");
    expect(dependencies.reload).toHaveBeenCalledTimes(1);
  });

  it("does not enter a reload loop when the asset remains unavailable", () => {
    // Arrange
    const event = new Event("vite:preloadError", { cancelable: true });
    const dependencies = createDependencies("90000", 100_000);

    // Act
    const recovered = recoverFromStaleChunk(event, dependencies);

    // Assert
    expect(recovered).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(dependencies.writeMarker).not.toHaveBeenCalled();
    expect(dependencies.reload).not.toHaveBeenCalled();
  });
});
