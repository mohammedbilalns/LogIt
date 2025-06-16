export interface ICryptoProvider {
  hash(data: string, saltRounds: number): Promise<string>;
  compare(data: string, encrypted: string): Promise<boolean>;
}
