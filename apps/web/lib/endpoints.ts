export const API_ENDPOINTS = {
    token: {
      NA: 'https://api.amazon.com/auth/o2/token',
      EU: 'https://api.amazon.co.uk/auth/o2/token',
      FE: 'https://api.amazon.co.jp/auth/o2/token'
    },
    advertising: {
      NA: 'https://advertising-api.amazon.com',
      EU: 'https://advertising-api-eu.amazon.com',
      FE: 'https://advertising-api-fe.amazon.com'
    }
  } as const;
  
  export type Region = keyof typeof API_ENDPOINTS.token;