// Declare module needs to be in a separate .d.ts file without any imports for it to work properly

declare module "ipfs-only-hash" {
  export function of(buffer: Buffer): Promise<string>;
}
