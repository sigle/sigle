export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  return new Response(`User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml`);
}
