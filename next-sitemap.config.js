/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://xdaily.vn",
  generateRobotsTxt: true,
  exclude: ["/admin/*", "/account/*", "/cart", "/checkout", "/api/*", "/server-sitemap.xml"],
  robotsTxtOptions: {
    additionalSitemaps: [
      `${(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://xdaily.vn").replace(/\/$/, "")}/server-sitemap.xml`,
    ],
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/cart", "/checkout", "/account"],
      },
    ],
  },
};
