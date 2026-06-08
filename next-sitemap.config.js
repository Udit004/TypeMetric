/**
 * next-sitemap configuration for TypeMetric
 * Generates sitemap files into the `public/` folder and a robots.txt.
 */
module.exports = {
  siteUrl: 'https://typemetric.vercel.app',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/api/*'],
};
module.exports = {
  siteUrl: 'https://type-metric.vercel.app',
  generateRobotsTxt: true,
}