// Events contain accepted player inputs and one-time entropy, never projections.
export type TableCreated = {
  type: 'TableCreated'; version: 1; actor: string;
  displayName: string; tableName: string; seed: string;
};
export type PlayerJoined = {
  type: 'PlayerJoined'; version: 1; actor: string; displayName: string;
};
export type LobbyEvent = TableCreated | PlayerJoined;
export type TableView = {
  name: string; players: { uid: string; name: string; host: boolean }[];
};

export function replay(events: readonly LobbyEvent[]): TableView | null {
  const created = events.find((event): event is TableCreated => event.type === 'TableCreated');
  if (!created) return null;
  const joined = events.filter((event): event is PlayerJoined => event.type === 'PlayerJoined');
  return {
    name: created.tableName,
    players: [
      { uid: created.actor, name: created.displayName, host: true },
      ...joined.filter(event => event.actor !== created.actor)
        .sort((a, b) => a.actor < b.actor ? -1 : a.actor > b.actor ? 1 : 0)
        .map(event => ({ uid: event.actor, name: event.displayName, host: false })),
    ],
  };
}

export function normalizeCode(code: string): string {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{8}$/.test(normalized)) throw new Error('Enter an 8-character table code.');
  return normalized;
}
