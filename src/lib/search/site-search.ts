import { mainHubs, specialHubs } from "@/lib/hub/hubs.v1";

export type SearchItem = {
  title: string;
  description?: string;
  href: string;
  kind?: "hub" | "page";
};

export type IndexedSearchItem = SearchItem & {
  key: string;
  normalizedTitle: string;
  normalizedDescription: string;
  normalizedPath: string;
  searchableTokens: string[];
};

type Translate = (key: string) => string;

export const MAX_SITE_SEARCH_RESULTS = 8;

export const SEARCH_SYNONYMS = [
  ["fine line", "ince cizgi"],
  ["lettering", "yazi isim harf"],
  ["realistic", "realistik"],
  ["portrait", "portre"],
  ["traditional", "traditional old school klasik"],
  ["old school", "traditional old school klasik"],
  ["cover up", "kapatma coverup"],
  ["coverup", "kapatma coverup"],
  ["blackwork", "blackwork siyah yogun"],
  ["tattoo", "dovme tattoo"],
  ["piercing", "piercing delme"],
] as const;

const TR_CHAR_FOLD_MAP: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  i: "i",
  ö: "o",
  ş: "s",
  ü: "u",
};

const CUSTOM_DESIGN_HUB = specialHubs.find(
  (hub) => hub.slug === "kisiye-ozel-dovme-tasarimi"
);
const CUSTOM_DESIGN_HREF =
  CUSTOM_DESIGN_HUB?.canonicalPath ?? "/kesfet/kisiye-ozel-dovme-tasarimi";

const PAGE_SEARCH_ITEMS = [
  { href: "/kesfet", titleKey: "common.nav.tattoo" },
  { href: "/piercing", titleKey: "common.nav.piercing" },
  { href: "/galeri-tasarim", titleKey: "common.nav.visuals" },
  { href: "/artistler", titleKey: "common.nav.artists" },
  { href: "/iletisim", titleKey: "common.nav.contact" },
  { href: CUSTOM_DESIGN_HREF, titleKey: "common.nav.customDesign" },
  { href: "/sss", titleKey: "common.nav.knowledgeBase" },
] as const;

export function normalizeSearchQuery(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (char) => TR_CHAR_FOLD_MAP[char] ?? char)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalizeSearchQuery(value).split(/\s+/).filter(Boolean);
}

function getAllowedDistance(tokenLength: number) {
  if (tokenLength >= 8) {
    return 2;
  }
  if (tokenLength >= 3) {
    return 1;
  }
  return 0;
}

function editDistanceAtMost(left: string, right: string, maxDistance: number) {
  if (Math.abs(left.length - right.length) > maxDistance) {
    return maxDistance + 1;
  }

  let previousRow = Array.from(
    { length: right.length + 1 },
    (_, index) => index
  );

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const currentRow = [leftIndex];
    let minRowValue = currentRow[0];

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const cost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      const nextValue = Math.min(
        previousRow[rightIndex] + 1,
        currentRow[rightIndex - 1] + 1,
        previousRow[rightIndex - 1] + cost
      );

      currentRow.push(nextValue);
      if (nextValue < minRowValue) {
        minRowValue = nextValue;
      }
    }

    if (minRowValue > maxDistance) {
      return maxDistance + 1;
    }

    previousRow = currentRow;
  }

  return previousRow[right.length];
}

function fuzzyTokenMatch(token: string, candidates: string[]) {
  const maxDistance = getAllowedDistance(token.length);
  if (maxDistance === 0) {
    return false;
  }

  return candidates.some((candidate) => {
    const distance = editDistanceAtMost(token, candidate, maxDistance);
    return distance <= maxDistance;
  });
}

function expandQueryTokens(normalizedQuery: string) {
  const queryTokens = new Set(tokenize(normalizedQuery));
  const paddedQuery = ` ${normalizedQuery} `;

  for (const [pattern, expansion] of SEARCH_SYNONYMS) {
    const normalizedPattern = normalizeSearchQuery(pattern);
    if (paddedQuery.includes(` ${normalizedPattern} `)) {
      tokenize(expansion).forEach((token) => queryTokens.add(token));
    }
  }

  return Array.from(queryTokens);
}

function createIndexedHubItems(t: Translate): IndexedSearchItem[] {
  return [...mainHubs, ...specialHubs].map((hub) => {
    const href = hub.canonicalPath ?? `/kesfet/${hub.slug}`;
    const title = t(hub.titleKey);
    const description = t(hub.descriptionKey);
    return {
      key: `hub:${hub.id}`,
      kind: "hub",
      title,
      description,
      href,
      normalizedTitle: normalizeSearchQuery(title),
      normalizedDescription: normalizeSearchQuery(description),
      normalizedPath: normalizeSearchQuery(href),
      searchableTokens: tokenize(
        `${title} ${description} ${hub.slug} ${href}`
      ),
    };
  });
}

function createIndexedPageItems(t: Translate): IndexedSearchItem[] {
  return PAGE_SEARCH_ITEMS.map(({ href, titleKey }) => {
    const title = t(titleKey);
    return {
    key: `page:${href}`,
    kind: "page",
    title,
    href,
    normalizedTitle: normalizeSearchQuery(title),
    normalizedDescription: "",
    normalizedPath: normalizeSearchQuery(href),
    searchableTokens: tokenize(`${title} ${href}`),
    };
  });
}

export function buildIndexedItems(t: Translate) {
  return [...createIndexedHubItems(t), ...createIndexedPageItems(t)];
}

export function searchSite(
  items: IndexedSearchItem[],
  query: string,
  maxResults = MAX_SITE_SEARCH_RESULTS
) {
  const normalizedQuery = normalizeSearchQuery(query.trim());
  const searchTokens = expandQueryTokens(normalizedQuery);
  if (!searchTokens.length) {
    return [];
  }

  return items
    .map((item) => {
      const score = searchTokens.reduce((total, token) => {
        let tokenScore = 0;
        let tokenMatched = false;

        if (item.normalizedTitle.startsWith(token)) {
          tokenScore += 100;
          tokenMatched = true;
        } else if (item.normalizedTitle.includes(token)) {
          tokenScore += 40;
          tokenMatched = true;
        }

        if (item.normalizedDescription.includes(token)) {
          tokenScore += 15;
          tokenMatched = true;
        }

        if (item.normalizedPath.includes(token)) {
          tokenScore += 5;
          tokenMatched = true;
        }

        if (!tokenMatched && fuzzyTokenMatch(token, item.searchableTokens)) {
          tokenScore += 10;
        }

        return total + tokenScore;
      }, 0);

      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return left.item.title.localeCompare(right.item.title, "tr-TR");
    })
    .slice(0, maxResults);
}

export function getSearchResults(
  items: IndexedSearchItem[],
  query: string,
  maxResults = MAX_SITE_SEARCH_RESULTS
): SearchItem[] {
  return searchSite(items, query, maxResults).map(({ item }) => item);
}
