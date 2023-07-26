import * as cheerio from 'cheerio';
import slugify from 'slugify';

export const extractTableOfContents = (
  html: string,
): Array<{ level: 2 | 3; text: string; id: string }> => {
  const $ = cheerio.load(html);
  const headings = $('h2, h3');
  const tableOfContents: Array<{ level: 2 | 3; text: string; id: string }> = [];

  headings.each((_index, heading) => {
    const level = heading.tagName.toLowerCase() === 'h2' ? 2 : 3;
    const text = $(heading).text();

    if (text) {
      const id = slugify(text, { lower: true, strict: true });
      tableOfContents.push({ level, text, id });
    }
  });

  return tableOfContents;
};
