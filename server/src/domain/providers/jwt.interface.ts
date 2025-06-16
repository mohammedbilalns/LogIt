export interface IJwtProvider<TPayload = Record<string, unknown>> {
  sign(payload: TPayload, options?: object): string;
  verify(token: string): TPayload;
  decode(token: string): TPayload | null;
}
