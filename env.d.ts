declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HYPERRATE_API_KEY: string;
    }
  }
  var __HYPERATE_API_KEY__: string;
}

export {};