// Global types used across the app
export {};

declare global {
  interface Window {
    storage: {
      get: (key: string) => Promise<{ value?: string }>;
      set: (key: string, value: string) => Promise<void>;
    };
  }
}
