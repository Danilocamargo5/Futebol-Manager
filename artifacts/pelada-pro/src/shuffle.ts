/** Fisher–Yates shuffle. Returns a new array and accepts an injectable RNG for tests. */
export function shufflePlayers<T>(players: readonly T[], random: () => number = Math.random): T[] {
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError('Random value must be between 0 (inclusive) and 1 (exclusive)');
    }
    const j = Math.floor(value * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
