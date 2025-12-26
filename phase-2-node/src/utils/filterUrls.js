export function filterArticleLinks(results, excludeDomain, limit = 5) {
    return results
      .filter(r =>
        r.link &&
        !r.link.includes(excludeDomain) &&
        !r.link.includes("youtube") &&
        !r.link.includes("linkedin") &&
        !r.link.includes("twitter") &&
        !r.link.includes("facebook") &&
        !r.link.includes("instagram")
      )
      .slice(0, limit);
  }
  