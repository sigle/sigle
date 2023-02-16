export const getAddressFromDid = (did: string): string => {
  return did.split(':')[4];
};
