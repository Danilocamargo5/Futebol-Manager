/** Compare full names consistently while allowing edits to the same player. */
export function isDuplicatePlayerName(
  players: ReadonlyArray<{ id: string; name: string }>,
  name: string,
  editingId?: string,
): boolean {
  const normalized = name.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
  if (!normalized) return false;
  return players.some(
    (player) =>
      player.id !== editingId &&
      player.name.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR") === normalized,
  );
}
