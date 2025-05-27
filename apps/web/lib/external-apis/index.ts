export * from './arxiv.service';
export * from './semanticScholar.service';
export * from './crossref.service';
export * from './pubmed.service';
export * from './core.service';

// You might also want to define a common search function here
// that aggregates results from multiple services, or a common result type.

export interface ExternalSearchQuery {
  searchText: string;
  sources?: ('arxiv' | 'semanticScholar' | 'crossref' | 'pubmed' | 'core')[]; // Which sources to query, defaults to all
  maxResultsPerSource?: number;
  // Add other common search params like date ranges, author filters if applicable across multiple APIs
}

export interface UnifiedSearchResultItem {
  source: string; // e.g., 'arXiv', 'Semantic Scholar'
  id: string; // Original ID from the source
  title: string;
  authors: string[]; // Simplified authors list
  abstract?: string | null;
  url?: string; // Link to the paper (e.g., DOI link, arXiv page, Semantic Scholar page)
  pdfUrl?: string | null;
  publishedDate?: string; // ISO string or human-readable
  // Add any other common fields you want to display
}

// Example of a combined search function (conceptual)
/*
export async function searchExternalSources(query: ExternalSearchQuery): Promise<UnifiedSearchResultItem[]> {
  const results: UnifiedSearchResultItem[] = [];
  const sourcesToQuery = query.sources || ['arxiv', 'semanticScholar', 'crossref', 'pubmed', 'core'];

  // This would involve calling each service's search function and mapping their specific results
  // to the UnifiedSearchResultItem structure.
  // This is a complex part that requires careful implementation for each API.

  if (sourcesToQuery.includes('arxiv')) {
    // const arxivResults = await searchArxiv({ query: query.searchText, maxResults: query.maxResultsPerSource });
    // Map arxivResults to UnifiedSearchResultItem and add to `results`
  }
  // ... and so on for other services

  console.log("Placeholder: Aggregating results from sources with query:", query);
  return Promise.resolve([
    {
        source: 'arXiv',
        id: 'http://arxiv.org/abs/test-paper-1',
        title: 'Sample arXiv Paper 1: The Theory of Everything',
        authors: ['Dr. Quantum', 'Prof. Universe'],
        abstract: 'This paper explores the fundamental nature of reality and proposes a unified theory.',
        publishedDate: new Date().toISOString(),
        url: 'http://arxiv.org/abs/test-paper-1',
        pdfUrl: 'http://arxiv.org/pdf/test-paper-1',
    },
    {
        source: 'Semantic Scholar',
        paperId: 's2-test-paper-123',
        title: 'Groundbreaking Research on AI Ethics',
        authors: ['Dr. AI Ethicist'],
        abstract: 'A comprehensive study on the ethical implications of advanced artificial intelligence.',
        publishedDate: String(new Date().getFullYear()),
        url: 'https://www.semanticscholar.org/paper/some-id',
    }
  ]);
}
*/ 