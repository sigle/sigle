// Can't use edge runtime because of https://github.com/vercel/next.js/issues/46492
// export const runtime = 'edge';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  return new Response(`User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml`);
}
