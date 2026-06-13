jest.mock('@react-native-async-storage/async-storage', () => {
  let storage: Record<string, string> = {};

  return {
    setItem: jest.fn(async (key: string, value: string) => {
      storage[key] = value;
      return Promise.resolve(value);
    }),
    getItem: jest.fn(async (key: string) => {
      return Promise.resolve(storage[key] ?? null);
    }),
    removeItem: jest.fn(async (key: string) => {
      delete storage[key];
      return Promise.resolve();
    }),
    clear: jest.fn(async () => {
      storage = {};
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(async () => Promise.resolve(Object.keys(storage))),
  };
});
