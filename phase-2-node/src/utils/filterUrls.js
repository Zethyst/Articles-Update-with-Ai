export function filterArticleLinks(results, excludeDomain) {
    return results
      .filter(r =>
        r.link &&
        !r.link.includes(excludeDomain) &&
        !r.link.includes("youtube") &&
        !r.link.includes("linkedin")
      )
      .slice(0, 2);
  }
  