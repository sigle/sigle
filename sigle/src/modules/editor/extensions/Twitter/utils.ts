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

export const TWITTER_REGEX =
  /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/;

export const TWITTER_REGEX_GLOBAL =
  /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(.+)?$/g;