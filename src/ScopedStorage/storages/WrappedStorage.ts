/* eslint-disable no-empty */
import type { BrowserStorage, ScopedStorage } from "../StorageTypes";

export class WrappedStorage<T> implements ScopedStorage<T> {
  constructor(
    public readonly type: BrowserStorage,
    private readonly _key: string,
    private readonly _storage: Storage
  ) {}
  get(): T | undefined {
    try {
      const result = this._storage.getItem(this._key);
      if (result != null) {
        return JSON.parse(result) as T;
      }
    } catch (e) {}
    return undefined;
  }
  set(value: T): void {
    try {
      this._storage.setItem(this._key, JSON.stringify(value));
    } catch (e) {}
  }
  remove(): void {
    try {
      this._storage.removeItem(this._key);
    } catch (e) {}
  }
}
