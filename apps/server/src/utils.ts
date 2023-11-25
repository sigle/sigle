export const generateAvatar = (stxAddress: string) => {
  return `https://source.boringavatars.com/marble/120/${stxAddress}?square&colors=da3a00,fa8158,ffa835,37c391,7c456cf`;
};

export const validDomainRegex = new RegExp(
  /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
);
