export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.24mobiles.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/'], // Don't crawl the admin section
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
