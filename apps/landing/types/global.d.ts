declare global {
  interface Window {
    fbq: (action: string, eventName: string, data?: Record<string, any>) => void;
  }
}

export {};
