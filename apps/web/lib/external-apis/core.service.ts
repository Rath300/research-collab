// apps/web/lib/external-apis/core.service.ts

const CORE_API_KEY = process.env.NEXT_PUBLIC_CORE_API_KEY;
const CORE_API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_BASE_URL;

interface CoreSearchParams {
  query: string;
  page?: number;
  pageSize?: number;
  // CORE API has many other specific query fields like author, title, doi, year, etc.
  // These can be added as specific params or as a generic 'filters' object.
}

interface CoreAuthor {
  name: string;
  // Other author details if available
}

interface CorePaper {
  id: string; // CORE ID
  title: string;
  authors?: CoreAuthor[]; // CORE API v3 authors is an array of strings
  abstract?: string | null;
  yearPublished?: number;
  doi?: string | null;
  downloadUrl?: string; // Direct PDF download URL if available
  sourceFulltextUrls?: string[]; // Other URLs to full text
  publisher?: string | null;
  // Add other relevant fields from CORE API response
}

/**
 * Searches the CORE API for open access research papers.
 *
 * @param params - Search parameters for CORE API.
 * @returns A promise that resolves to an array of CorePaper objects.
 */
export async function searchCore(params: CoreSearchParams): Promise<CorePaper[]> {
  if (!CORE_API_BASE_URL) {
    console.error('CORE_API_BASE_URL is not configured.');
    throw new Error('CORE API base URL not configured.');
  }
  if (!CORE_API_KEY) {
    console.error('CORE_API_KEY is not configured. CORE API requires an API key.');
    throw new Error('CORE API key not configured.');
  }

  const queryParams = new URLSearchParams({
    q: params.query,
    page: (params.page || 1).toString(),
    limit: (params.pageSize || 10).toString(), // CORE API uses 'limit' not 'pageSize' for v3 search
    apiKey: CORE_API_KEY, // CORE API v3 uses apiKey in query params
  });

  const url = `${CORE_API_BASE_URL}search/articles?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Try to parse error from CORE if available
      let errorBody = 'Unknown error';
      try {
        const errorData = await response.json();
        errorBody = errorData.message || JSON.stringify(errorData);
      } catch (e) { /* Ignore if error body is not JSON */ }
      throw new Error(`CORE API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    
    // CORE API v3 search/articles returns an object with a 'results' array
    const results = data.results || [];
    if (!Array.isArray(results)) {
        console.error("CORE API did not return a results array or it's malformed", data);
        return [];
    }

    return results.map(mapCoreResultToPaper).filter((paper): paper is CorePaper => paper !== null);

  } catch (error) {
    console.error('Error searching CORE API:', error);
    throw error;
  }
}

function mapCoreResultToPaper(result: any): CorePaper | null {
  if (!result || !result.id) return null;

  // CORE authors are typically an array of strings
  const authors = Array.isArray(result.authors) ? result.authors.map((name: any) => ({ name: String(name) })) : [];

  return {
    id: String(result.id),
    title: result.title || 'No title',
    authors,
    abstract: result.abstract || null,
    yearPublished: result.yearPublished || (result.publishedDate ? new Date(result.publishedDate).getFullYear() : undefined),
    doi: result.doi || null,
    downloadUrl: result.downloadUrl || (Array.isArray(result.sourceFulltextUrls) && result.sourceFulltextUrls.length > 0 ? result.sourceFulltextUrls[0] : undefined),
    sourceFulltextUrls: result.sourceFulltextUrls || [],
    publisher: result.publisher || null,
  };
} 
 
 
 