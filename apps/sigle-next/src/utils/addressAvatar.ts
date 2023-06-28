export const addressAvatar = (address: string, size: number = 120) => {
  if (address.startsWith('0x')) {
    address = address.replace('0x', '').toLowerCase();
  }
  return `https://source.boringavatars.com/beam/${size}/${address}?square&colors=6558FF,FF6E3C,B9F3DE,D0C9FF,FFDAAE`;
};
