declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HYPERRATE_API_KEY: string;
    }
  }
}

export {};