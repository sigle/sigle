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

  return $.html();
};
