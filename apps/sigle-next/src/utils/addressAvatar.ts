export const addressAvatar = (address: string, size: number = 120) => {
  if (address.startsWith('0x')) {
    address = address.replace('0x', '');
  }
  return `https://source.boringavatars.com/marble/${size}/${address}?square&colors=da3a00,fa8158,ffa835,37c391,7c456cf`;
};
