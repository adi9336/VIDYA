export function createSessionId(): string {
  return `session-${Math.random().toString(36).slice(2, 10)}`;
}
