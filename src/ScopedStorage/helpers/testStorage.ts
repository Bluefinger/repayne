import type { BrowserStorage } from "../StorageTypes";
import { WrappedStorage } from "../storages/WrappedStorage";

const tested = Object.create(null) as Record<string, boolean>;

export const testStorage = <T>(
  type: BrowserStorage,
  key: string,
  scope: Window
): WrappedStorage<T> | undefined => {
  const storage = scope[type];
  if (!(type in tested)) {
    try {
      const test = `test-${type}-${Date.now()}`;
      storage.setItem(test, test);
      const result = storage.getItem(test);
      storage.removeItem(test);
      tested[type] = result === test;
    } catch (e) {
      tested[type] = false;
    }
  }
  if (tested[type]) {
    return new WrappedStorage<T>(type, key, storage);
  }
};
