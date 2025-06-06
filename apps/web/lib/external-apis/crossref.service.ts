// apps/web/lib/external-apis/crossref.service.ts

const CROSSREF_API_BASE_URL = process.env.NEXT_PUBLIC_CROSSREF_API_BASE_URL;
const CROSSREF_MAILTO = process.env.NEXT_PUBLIC_CROSSREF_MAILTO;

interface CrossrefSearchParams {
  query: string; // General query string, e.g., for title, author, etc.
  filter?: Record<string, string>; // e.g., { type: 'journal-article', 'from-online-pub-date': '2020' }
  rows?: number;
  offset?: number;
  sortBy?: string; // e.g., 'score' or 'created' or 'published'
  sortOrder?: 'asc' | 'desc';
}

interface CrossrefAuthor {
  given?: string;
  family?: string;
  ORCID?: string;
  sequence?: string; // e.g., 'first', 'additional'
  affiliation?: { name: string }[];
}

interface CrossrefDateParts {
  'date-parts': number[][]; // e.g., [[2023, 5, 1]]
  'date-time'?: string; // ISO 8601 string
  timestamp?: number;
}

interface CrossrefPaper {
  DOI: string;
  title: string[]; // Titles can be an array
  authors?: CrossrefAuthor[];
  publisher?: string;
  publishedDate?: CrossrefDateParts; // Using 'published-print' or 'published-online' or 'created'
  abstract?: string; // Note: CrossRef often does NOT have abstracts.
  URL?: string; // Link to the publisher page or DOI link (usually just the DOI URL itself)
  type?: string; // e.g., 'journal-article'
  ISSN?: string[];
  journalTitle?: string; // Often under container-title
  // Add other relevant fields from CrossRef response
}

/**
 * Searches the CrossRef API for publications.
 *
 * @param params - Search parameters for CrossRef.
 * @returns A promise that resolves to an array of CrossrefPaper objects.
 */
export async function searchCrossref(params: CrossrefSearchParams): Promise<CrossrefPaper[]> {
  if (!CROSSREF_API_BASE_URL) {
    console.error('CROSSREF_API_BASE_URL is not configured.');
    throw new Error('CrossRef API base URL not configured.');
  }
  if (!CROSSREF_MAILTO) {
    console.warn('CROSSREF_MAILTO is not configured. This is recommended for polite API usage with CrossRef.');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('query.bibliographic', params.query); // For general bibliographic queries
  // queryParams.append('query.author', params.authorQuery); // Can also add specific field queries
  // queryParams.append('query.title', params.titleQuery);
  queryParams.append('rows', (params.rows || 10).toString());
  queryParams.append('offset', (params.offset || 0).toString());

  if (params.sortBy) queryParams.append('sort', params.sortBy);
  if (params.sortOrder) queryParams.append('order', params.sortOrder);
  if (CROSSREF_MAILTO) queryParams.append('mailto', CROSSREF_MAILTO);

  if (params.filter) {
    Object.entries(params.filter).forEach(([key, value]) => {
      queryParams.append(`filter`, `${key}:${value}`);
    });
  }

  const url = `${CROSSREF_API_BASE_URL}works?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CrossRef API request failed: ${response.status} ${await response.text()}`);
    }
    const data = await response.json();

    // Results are usually in data.message.items
    const items = data.message?.items || [];
    if (!Array.isArray(items)) {
        console.error("CrossRef API did not return items array or it's malformed", data);
        return [];
    }

    return items.map(mapCrossrefItemToPaper).filter((paper): paper is CrossrefPaper => paper !== null);

  } catch (error) {
    console.error('Error searching CrossRef:', error);
    throw error;
  }
}

function mapCrossrefItemToPaper(item: any): CrossrefPaper | null {
  if (!item || !item.DOI) return null;

  // Title is an array, take the first one usually
  const title = Array.isArray(item.title) && item.title.length > 0 ? item.title : (item.title ? [String(item.title)] : []);

  const authors: CrossrefAuthor[] = Array.isArray(item.author) ? item.author.map((auth: any) => ({
    given: auth.given,
    family: auth.family,
    ORCID: auth.ORCID,
    sequence: auth.sequence,
    affiliation: Array.isArray(auth.affiliation) ? auth.affiliation.map((aff:any) => ({name: aff.name})) : []
  })) : [];
  
  // CrossRef has multiple date fields like 'published-print', 'published-online', 'created', 'issued'
  // We try to pick one, preferring published ones.
  const publishedDate = item['published-print'] || item['published-online'] || item.issued || item.created;

  return {
    DOI: item.DOI,
    title: title,
    authors,
    publisher: item.publisher,
    publishedDate: publishedDate as CrossrefDateParts, // Cast as it can be complex
    abstract: item.abstract ? String(item.abstract).replace(/<[^>]*>/gm, '') : undefined, // Basic stripping of JATS XML if present
    URL: item.URL, // This is usually the DOI link
    type: item.type,
    ISSN: item.ISSN,
    journalTitle: Array.isArray(item['container-title']) ? item['container-title'].join(', ') : item['container-title'],
  };
} 
 
 
 
 