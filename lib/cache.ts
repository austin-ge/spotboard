/**
 * Minimal in-memory TTL cache with a max-entry bound.
 * Evicts the oldest entry once the cap is reached, so module-level
 * caches in long-running route handlers can't grow unbounded.
 */
export class TTLCache<T> {
  private map = new Map<string, { value: T; ts: number }>();

  constructor(
    private ttlMs: number,
    private maxEntries = 500
  ) {}

  get(key: string): T | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.ts > this.ttlMs) {
      this.map.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.map.size >= this.maxEntries && !this.map.has(key)) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.delete(key); // re-insert to keep insertion order ≈ recency
    this.map.set(key, { value, ts: Date.now() });
  }
}
