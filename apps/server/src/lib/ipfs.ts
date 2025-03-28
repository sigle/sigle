import { CID } from "multiformats/cid";
import { code } from "multiformats/codecs/raw";
import { sha256 } from "multiformats/hashes/sha2";
import { parse } from "multiformats/link";

export const createCIDv1FromBuffer = async (buffer: Buffer) => {
  const hash = await sha256.digest(buffer as unknown as Uint8Array);
  const cidv1 = CID.create(1, code, hash);
  return cidv1.toString();
};

export const convertCIDv0toCIDv1 = (cidv0: string) => {
  return parse(cidv0).toV1().toString();
};
