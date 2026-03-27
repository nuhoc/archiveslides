const Image = require("@11ty/eleventy-img");
const path = require("path");

// Process a single image: generate WebP thumb + full-size WebP
async function processImage(src, outputDir) {
  const stats = await Image(src, {
    widths: [400, 1600],
    formats: ["webp", "jpeg"], // webp primary, jpeg fallback
    outputDir: path.join(outputDir, "img"),
    urlPath: "/img/",
    filenameFormat: (id, src, width, format) => {
      const name = path.basename(src, path.extname(src));
      return `${name}-${width}.${format}`;
    },
    sharpWebpOptions: { quality: 80 },
    sharpJpegOptions: { quality: 82 },
  });
  return stats;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  // Collect all unique keywords across photos
  eleventyConfig.addFilter("allTags", (photos) => {
    const tags = new Set();
    for (const p of photos) {
      const kw = p.Keywords || [];
      const list = Array.isArray(kw) ? kw : [kw];
      list.forEach((k) => tags.add(k));
    }
    return [...tags].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  });

  // Format exiftool date "YYYY:MM:DD HH:MM:SS" → readable string
  eleventyConfig.addFilter("formatDate", (dateStr) => {
    if (!dateStr) return "";
    const cleaned = dateStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
    const d = new Date(cleaned);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Get year from exiftool date
  eleventyConfig.addFilter("getYear", (dateStr) => {
    if (!dateStr) return "";
    return dateStr.substring(0, 4);
  });

  // Collect all unique years
  eleventyConfig.addFilter("allYears", (photos) => {
    const years = new Set();
    for (const p of photos) {
      if (p.DateTimeOriginal) years.add(p.DateTimeOriginal.substring(0, 4));
    }
    return [...years].sort();
  });

  // Ensure keywords is always an array
  eleventyConfig.addFilter("ensureArray", (val) => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  });

  // Async shortcode for responsive image output
  eleventyConfig.addNunjucksAsyncShortcode(
    "galleryImage",
    async function (src, alt, cls) {
      const imgPath = path.join("images/full", src);
      let stats;
      try {
        stats = await processImage(imgPath, "_site");
      } catch (e) {
        console.warn(`Could not process ${src}: ${e.message}`);
        return `<img src="/images/full/${src}" alt="${alt}" class="${cls}" loading="lazy" />`;
      }

      const thumb = stats.webp?.find((s) => s.width === 400) || stats.jpeg?.find((s) => s.width === 400);
      const full = stats.webp?.find((s) => s.width === 1600) || stats.jpeg?.find((s) => s.width === 1600);

      return `<img src="${thumb.url}" data-full="${full.url}" alt="${alt}" class="${cls}" width="${thumb.width}" height="${thumb.height}" loading="lazy" decoding="async" />`;
    }
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      data: "../_data",
      includes: "_includes",
    },
  };
};