import "@testing-library/jest-dom/vitest"

function createStorage(): Storage {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => store.delete(key),
    setItem: (key, value) => store.set(key, String(value)),
  }
}

if (typeof window !== "undefined") {
  const localStorageMock = createStorage()
  const sessionStorageMock = createStorage()

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: localStorageMock,
  })
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: sessionStorageMock,
  })
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: localStorageMock,
  })
  Object.defineProperty(window, "sessionStorage", {
    configurable: true,
    value: sessionStorageMock,
  })
}
