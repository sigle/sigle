"use client";

import Script from "next/script";

export const TwitterEmbed = () => {
  const loadTweets = () => {
    const tweetElements = document.querySelectorAll(".prose div[data-twitter]");
    for (const tweetElement of tweetElements) {
      const tweetId = tweetElement.getAttribute("data-twitter-id");
      // @ts-expect-error Twitter is attached to the window.
      window.twttr.widgets.createTweet(tweetId, tweetElement);
    }
  };

  return (
    <Script src="https://platform.twitter.com/widgets.js" onLoad={loadTweets} />
  );
};
