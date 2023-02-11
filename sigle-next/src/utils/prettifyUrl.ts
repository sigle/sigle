/**
 * Prettify a URL by removing the protocol and the last slash
 */
export const prettifyUrl = (url: string) => {
  const prettyUrl = url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '');
  return prettyUrl;
};
