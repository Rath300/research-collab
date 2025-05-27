// apps/web/lib/external-apis/crossref.service.ts

const CROSSREF_API_BASE_URL = process.env.NEXT_PUBLIC_CROSSREF_API_BASE_URL;
const CROSSREF_MAILTO = process.env.NEXT_PUBLIC_CROSSREF_MAILTO;

interface CrossrefSearchParams {
  query: string; // General query string
  filter?: Record<string, string>; // e.g., { type: 'journal-article', 'from-online-pub-date': '2020' }
  rows?: number;
  offset?: number;
  sortBy?: string; // e.g., 'score' or 'created'
  sortOrder?: 'asc' | 'desc';
}

interface CrossrefAuthor {
  given?: string;
  family?: string;
  ORCID?: string;
  // Other author fields from CrossRef
}

interface CrossrefPaper {
  DOI: string;
  title: string[]; // Titles can be an array
  authors?: CrossrefAuthor[];
  publisher?: string;
  publishedDateParts?: number[][]; // e.g., [[2023, 5, 1]]
  abstract?: string; // Note: CrossRef often does NOT have abstracts.
  URL?: string; // Link to the publisher page or DOI link
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
    return [];
  }
  if (!CROSSREF_MAILTO) {
    console.warn('CROSSREF_MAILTO is not configured. This is recommended for polite API usage.');
  }

  // Example endpoint: /works?query.bibliographic=machine+learning&filter=type:journal-article&rows=5&mailto=your-email@example.com
  // let url = `${CROSSREF_API_BASE_URL}works?query.bibliographic=${encodeURIComponent(params.query)}&rows=${params.rows || 10}&offset=${params.offset || 0}`;
  // if (CROSSREF_MAILTO) url += `&mailto=${CROSSREF_MAILTO}`;
  // if (params.filter) {
  //   Object.entries(params.filter).forEach(([key, value]) => {
  //     url += `&filter=${key}:${encodeURIComponent(value)}`;
  //   });
  // }

  console.log('Placeholder: Searching CrossRef with params:', params);
  // In a real implementation:
  // 1. Construct URL with query, filters, rows, offset, mailto.
  // 2. Fetch data.
  // 3. Parse JSON response (usually response.message.items).
  // 4. Map to CrossrefPaper[].
  // 5. Handle errors.

  // Placeholder data
  return Promise.resolve([
    {
      DOI: '10.1234/test.doi.5678',
      title: ['A Study on Cross-Referencing Academic Literature'],
      authors: [{ family: 'Researcher', given: 'Ron' }],
      publisher: 'Scholarly Publishing Inc.',
      publishedDateParts: [[new Date().getFullYear(), new Date().getMonth() + 1]],
      URL: 'https://doi.org/10.1234/test.doi.5678',
    },
  ]);
} 