import { feedPlugin } from "@11ty/eleventy-plugin-rss";

const TR_MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

export default function (eleventyConfig) {
  // Statik dosyalar
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/assets/logo/favicon.svg": "favicon.svg" });

  // Blog koleksiyonu (taslaklar canlıya çıkmaz)
  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/blog/posts/*.md")
      .filter((p) => !p.data.draft)
      .sort((a, b) => b.date - a.date)
  );

  // Filtreler
  eleventyConfig.addFilter("trDate", (d) => {
    const date = new Date(d);
    return `${date.getDate()} ${TR_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  });
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("byCategory", (arr, c) => (arr || []).filter((x) => x.category === c));
  eleventyConfig.addFilter("findBySlug", (arr, slug) => (arr || []).find((x) => x.slug === slug));
  eleventyConfig.addFilter("bySlugs", (arr, slugs) =>
    (slugs || []).map((s) => (arr || []).find((x) => x.slug === s)).filter(Boolean)
  );
  eleventyConfig.addFilter("postsForSolution", (posts, slug) =>
    (posts || []).filter((p) => (p.data.related_solutions || []).includes(slug))
  );
  eleventyConfig.addFilter("readingTime", (content) => {
    const words = String(content || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  });
  eleventyConfig.addFilter("exceptUrl", (arr, url) => (arr || []).filter((p) => p.url !== url));
  eleventyConfig.addFilter("pad2", (n) => String(n).padStart(2, "0"));
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("absUrl", (path, base) => new URL(path || "/", base).href);

  // RSS
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "posts", limit: 20 },
    metadata: {
      language: "tr",
      title: "Advance Digital Blog",
      subtitle: "Reklam teknolojileri, Addressable TV ve yeni nesil formatlar üzerine yazılar.",
      base: "https://advancedigital.media/",
      author: { name: "Advance Digital" },
    },
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}
