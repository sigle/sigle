export const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be)\/(?!channel\/)(?!@)(.+)?$/;
export const YOUTUBE_REGEX_GLOBAL =
  /^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be)\/(?!channel\/)(?!@)(.+)?$/g;

export const isValidYoutubeUrl = (url: string) => {
  return url.match(YOUTUBE_REGEX);
};

export const getYoutubeEmbedUrl = (nocookie?: boolean) => {
  return nocookie
    ? "https://www.youtube-nocookie.com/embed/"
    : "https://www.youtube.com/embed/";
};

export const getEmbedUrlFromYoutubeUrl = ({
  url,
  nocookie,
}: {
  url: string;
  nocookie?: boolean;
}) => {
  if (!isValidYoutubeUrl(url)) {
    return null;
  }

  // if is already an embed url, return it
  if (url.includes("/embed/")) {
    return url;
  }

  // if is a youtu.be url, get the id after the /
  if (url.includes("youtu.be")) {
    const id = url.split("/").pop();

    if (!id) {
      return null;
    }
    return `${getYoutubeEmbedUrl(nocookie)}${id}`;
  }

  const videoIdRegex = /(?:v=|shorts\/)([-\w]+)/gm;
  const matches = videoIdRegex.exec(url);

  if (!matches || !matches[1]) {
    return null;
  }

  const outputUrl = `${getYoutubeEmbedUrl(nocookie)}${matches[1]}`;

  return outputUrl;
};
