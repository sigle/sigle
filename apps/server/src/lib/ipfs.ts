import { CID } from "multiformats/cid";
import { code } from "multiformats/codecs/raw";
import { sha256 } from "multiformats/hashes/sha2";

export const createCIDv1FromBuffer = async (buffer: Buffer) => {
  const hash = await sha256.digest(buffer);
  const cidv1 = CID.create(1, code, hash);
  return cidv1.toString();
};
