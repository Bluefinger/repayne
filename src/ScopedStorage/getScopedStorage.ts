import { StorageType, ScopedStorage } from "./StorageTypes";
import { testStorage } from "./helpers/testStorage";
import { FallbackStorage } from "./storages/FallbackStorage";
import { testGlobalScope } from "./helpers/testGlobalScope";

let fallback: Map<string, any> | undefined;

export const getScopedStorage = <T extends any>(
  type: StorageType,
  key: string,
  globalScope?: any
): ScopedStorage<T> => {
  const scope = testGlobalScope(globalScope);
  let storage: ScopedStorage<T> | undefined;
  switch (type) {
    case StorageType.LOCAL:
      storage = testStorage<T>(StorageType.LOCAL, key, scope);
      if (storage) break;
    // fallthrough
    case StorageType.SESSION:
      storage = testStorage<T>(StorageType.SESSION, key, scope);
      if (storage) break;
    // fallthrough
    default:
      // Lazy-load fallback storage. No need to initialise it until it is specifically needed
      if (!fallback) {
        fallback = new Map<string, any>();
      }
      storage = new FallbackStorage<T>(key, fallback);
  }
  return storage;
};
