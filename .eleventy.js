const Image = require("@11ty/eleventy-img");
const crypto = require("crypto");

module.exports = function(eleventyConfig) {
  // Image Shortcode
  eleventyConfig.addNunjucksAsyncShortcode("image", async function(src, alt = "", classes = "", sizes = "(min-width: 30em) 50vw, 100vw") {
    if(alt === undefined) {
      alt = "";
    }
    let metadata = await Image(src, {
      widths: [300, 600, 1200],
      formats: ["avif", "webp", "jpeg"],
      outputDir: "./_site/img/",
      urlPath: "/img/",
      filenameFormat: function (id, src, width, format, options) {
        const hash = crypto.createHash('md5').update(src).digest('hex').slice(0, 10);
        return `img-${hash}-${width}w.${format}`;
      }
    });

    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
      class: classes,
    };

    return Image.generateHTML(metadata, imageAttributes);
  });

  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addFilter("date", function(date, format) {
    const d = date ? new Date(date) : new Date();
    if (format === "YYYY") return d.getFullYear();
    if (format === "MMM D, YYYY") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    return d.toLocaleDateString();
  });

  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const site = require("./src/_data/site.json");
    const tags = new Set(site.categories || []);
    collectionApi.getAll().forEach(item => {
      (item.data.tags || []).forEach(tag => {
        if (!["all", "nav", "post", "posts"].includes(tag)) {
          tags.add(tag);
        }
      });
    });
    return Array.from(tags).sort();
  });

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
