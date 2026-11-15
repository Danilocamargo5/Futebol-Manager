type NamedPlayer = { id: string; name: string };

const normalizeName = (value: string): string =>
  value.normalize("NFC")
    // Ignore invisible separators that can bypass duplicate-name checks.
    .replace(/[\u200B\u2060\uFEFF]/g, "")
    .trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");

/** Compare full names consistently while allowing edits to the same player. */
export function isDuplicatePlayerName(
  players: ReadonlyArray<NamedPlayer>,
  name: string,
  editingId?: string,
): boolean {
  const normalized = normalizeName(name);
  if (!normalized) return false;
  return players.some(
    (player) => player.id !== editingId && normalizeName(player.name) === normalized,
  );
}

/** Apply the same name rules when creating and editing players. */
export function getPlayerNameError(
  players: ReadonlyArray<NamedPlayer>,
  name: string,
  editingId?: string,
): string | null {
  if (!normalizeName(name)) return "Informe o nome do jogador.";
  if (isDuplicatePlayerName(players, name, editingId)) {
    return "Já existe um jogador com esse nome.";
  }
  return null;
}
