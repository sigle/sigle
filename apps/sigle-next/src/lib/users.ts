export const getDefaultAvatarUrl = (address: string) => {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${address}`;
};
