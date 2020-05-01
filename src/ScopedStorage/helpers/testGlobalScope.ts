export const testGlobalScope = (globalScope?: any): Window => {
  if (!globalScope) {
    try {
      globalScope = window;
    } catch (e) {
      globalScope = {} as Window;
    }
  }
  return globalScope;
};
