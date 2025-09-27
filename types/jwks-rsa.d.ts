declare module 'jwks-rsa' {
  interface JwksClientOptions {
    jwksUri: string;
    cache?: boolean;
    cacheMaxAge?: number;
    rateLimit?: boolean;
    jwksRequestsPerMinute?: number;
  }

  interface SigningKey {
    getPublicKey(): string | Buffer;
  }

  function jwksClient(options: JwksClientOptions): {
    getSigningKey(kid: string, cb: (err: Error | null, key?: SigningKey) => void): void;
  };

  export default jwksClient;
}
