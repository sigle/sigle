import * as cheerio from 'cheerio';
import slugify from 'slugify';

export const addIdsToHeadings = (html: string): string => {
  const $ = cheerio.load(html);
  const headings = $('h2, h3');

  headings.each((_index, heading) => {
    const text = $(heading).text();
    const id = slugify(text, { lower: true, strict: true });

    $(heading).attr('id', id);
  });

  const buttonsCta = $('a[data-type="button-cta"]');
  buttonsCta.each((_index, button) => {
    // wrap button in div to center it
    $(button).wrap('<div class="flex justify-center"></div>');
    // Add class to button to style it
    $(button).addClass(
      'bg-black text-white py-2 px-5 hover:opacity-90 rounded-lg text-sm',
    );
  });

  const twitterEmbed = $('div[data-twitter]');
  twitterEmbed.each((_index, embed) => {
    $(embed).addClass('flex justify-center');
  });

  return $.html();
};
