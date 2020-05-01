import { ScopedStorage, StorageType } from "../StorageTypes";

export class FallbackStorage<T> implements ScopedStorage<T> {
  public readonly type = StorageType.NONE;
  constructor(
    private readonly _key: string,
    private readonly _storage: Map<string, any>
  ) {}
  get() {
    return this._storage.get(this._key) as T | undefined;
  }
  set(value: T) {
    this._storage.set(this._key, value);
  }
  remove() {
    this._storage.delete(this._key);
  }
}
