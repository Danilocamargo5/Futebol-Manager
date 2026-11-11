/** Compare full names consistently while allowing edits to the same player. */
export function isDuplicatePlayerName(
  players: ReadonlyArray<{ id: string; name: string }>,
  name: string,
  editingId?: string,
): boolean {
  const normalizeName = (value: string): string =>
    value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
  const normalized = normalizeName(name);
  if (!normalized) return false;
  return players.some(
    (player) => player.id !== editingId && normalizeName(player.name) === normalized,
  );
}
