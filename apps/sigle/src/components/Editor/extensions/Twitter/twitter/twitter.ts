export const TWITTER_REGEX =
  /^https?:\/\/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/;

export const TWITTER_REGEX_GLOBAL =
  /^https?:\/\/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(.+)?$/g;

export const getTweetIdFromUrl = (url: string | undefined) =>
  url?.split("/")[5]?.split("?")[0];

export const isValidTwitterUrl = (url: string) => {
  return url.match(TWITTER_REGEX);
};
