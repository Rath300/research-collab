// apps/web/lib/external-apis/pubmed.service.ts

const PUBMED_API_KEY = process.env.NEXT_PUBLIC_PUBMED_API_KEY;
const PUBMED_API_BASE_URL = process.env.NEXT_PUBLIC_PUBMED_API_BASE_URL;

interface PubmedSearchParams {
  term: string; // Search term
  retmax?: number; // Max results to return
  retstart?: number; // Starting index of results
  sort?: string; // e.g., 'relevance', 'pub+date'
  mindate?: string; // YYYY/MM/DD
  maxdate?: string; // YYYY/MM/DD
}

interface PubmedArticleAuthor {
    name: string;
    authtype?: string; // e.g., "Author"
}

interface PubmedArticle {
  uid: string; // PubMed ID (PMID)
  title: string;
  authors: PubmedArticleAuthor[];
  pubDate: string; // Publication date (format varies, try to normalize to YYYY-MM-DD or similar)
  epubDate?: string; // Electronic publication date
  source: string; // Journal name or book title
  abstract?: string; // Often needs a separate fetch (efetch) or careful parsing from esummary. For now, we'll see what esummary provides.
  articleIds: { idtype: string, value: string }[]; // e.g., doi, pmc, pmid
  volume?: string;
  issue?: string;
  pages?: string;
}

/**
 * Searches PubMed via NCBI E-utilities.
 * This usually involves a two-step process: esearch to get IDs, then esummary/efetch to get details.
 *
 * @param params - Search parameters for PubMed.
 * @returns A promise that resolves to an array of PubmedArticle objects.
 */
export async function searchPubmed(params: PubmedSearchParams): Promise<PubmedArticle[]> {
  if (!PUBMED_API_BASE_URL) {
    console.error('PUBMED_API_BASE_URL is not configured.');
    throw new Error('PubMed API base URL not configured.');
  }

  const apiKeyParam = PUBMED_API_KEY ? `&api_key=${PUBMED_API_KEY}` : '';
  const retmax = params.retmax || 10;

  try {
    // Step 1: ESearch to get UIDs (PubMed IDs)
    const esearchParams = new URLSearchParams({
      db: 'pubmed',
      term: params.term,
      retmax: retmax.toString(),
      retstart: (params.retstart || 0).toString(),
      sort: params.sort || 'relevance',
      usehistory: 'y', // Using history is good practice for subsequent efetch/esummary calls if needed beyond basics
      retmode: 'json',
    });
    if (params.mindate) esearchParams.append('mindate', params.mindate);
    if (params.maxdate) esearchParams.append('maxdate', params.maxdate);
    if (PUBMED_API_KEY) esearchParams.append('api_key', PUBMED_API_KEY);

    const esearchUrl = `${PUBMED_API_BASE_URL}esearch.fcgi?${esearchParams.toString()}`;
    const esearchResponse = await fetch(esearchUrl);
    if (!esearchResponse.ok) {
      throw new Error(`PubMed ESearch request failed: ${esearchResponse.status} ${await esearchResponse.text()}`);
    }
    const esearchData = await esearchResponse.json();

    const idList = esearchData.esearchresult?.idlist;
    if (!idList || idList.length === 0) {
      return []; // No results found
    }

    // Step 2: ESummary to get summaries for UIDs
    const esummaryParams = new URLSearchParams({
        db: 'pubmed',
        id: idList.join(','),
        retmode: 'json',
    });
    if (PUBMED_API_KEY) esummaryParams.append('api_key', PUBMED_API_KEY);

    const esummaryUrl = `${PUBMED_API_BASE_URL}esummary.fcgi?${esummaryParams.toString()}`;
    const esummaryResponse = await fetch(esummaryUrl);
    if (!esummaryResponse.ok) {
      throw new Error(`PubMed ESummary request failed: ${esummaryResponse.status} ${await esummaryResponse.text()}`);
    }
    const esummaryData = await esummaryResponse.json();

    if (!esummaryData.result) {
        console.error('PubMed ESummary result is missing', esummaryData);
        return [];
    }
    
    // The actual articles are within esummaryData.result, indexed by their UIDs
    // delete esummaryData.result.uids; // Remove the uids array from the result object itself
    const articles: PubmedArticle[] = Object.values(esummaryData.result)
      .filter((item: any) => item && typeof item === 'object' && item.uid) // Filter out the uids array itself and ensure item is an object with uid
      .map(mapEsummaryItemToPubmedArticle)
      .filter((article): article is PubmedArticle => article !== null);

    return articles;

  } catch (error) {
    console.error('Error searching PubMed:', error);
    throw error;
  }
}

function mapEsummaryItemToPubmedArticle(item: any): PubmedArticle | null {
  if (!item || !item.uid) return null;

  // ESummary authors are in an array, each object has a 'name'
  const authors: PubmedArticleAuthor[] = Array.isArray(item.authors) 
    ? item.authors.map((auth: any) => ({ name: auth.name || 'Unknown Author', authtype: auth.authtype })) 
    : [];

  // ESummary provides articleids like doi, pmc etc.
  const articleIds: { idtype: string; value: string }[] = Array.isArray(item.articleids)
    ? item.articleids.filter((idObj: any) => idObj.idtype && idObj.value)
    : [];

  return {
    uid: item.uid,
    title: item.title || 'No title',
    authors,
    pubDate: item.pubdate || '', // Further normalization might be needed
    epubDate: item.epubdate || undefined,
    source: item.source || 'N/A',
    articleIds,
    volume: item.volume || undefined,
    issue: item.issue || undefined,
    pages: item.pages || undefined,
    // Abstract is typically not in esummary in full. EFetch would be needed for that.
    // For now, we'll leave abstract undefined or try to find a snippet if available in some esummary versions.
    abstract: item.abstract || undefined, // Placeholder, esummary might not have this
  };
}

// Helper function (to be implemented) to map esummary result to PubmedArticle[] structure
// function mapEsummaryResultToPubmedArticles(result: any): PubmedArticle[] { /* ... */ return []; } 
 