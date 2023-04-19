export const shortenAddress = (address: string) => {
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
};
