export const TWITTER_REGEX =
  /^https?:\/\/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/;
export const TWITTER_REGEX_GLOBAL =
  /^https?:\/\/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(.+)?$/g;

const WIDGET_SCRIPT_URL = 'https://platform.twitter.com/widgets.js';

export const loadTwitterWidget = async (): Promise<void> => {
  // @ts-expect-error Twitter is attached to the window.
  if (window.twttr) {
    return;
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = WIDGET_SCRIPT_URL;
    script.async = true;
    document.body?.appendChild(script);
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject();
    };
  });
};

export const getTweetIdFromUrl = (url: string | undefined) =>
  url?.split('/')[5]?.split('?')[0];

export const createTweet = async (
  tweetId: string,
  ref: React.MutableRefObject<HTMLDivElement | null>,
) => {
  // @ts-expect-error Twitter is attached to the window.
  return await window.twttr.widgets.createTweet(tweetId, ref.current);
};

export const isValidTwitterUrl = (url: string) => {
  return url.match(TWITTER_REGEX);
};
