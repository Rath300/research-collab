// apps/web/lib/external-apis/arxiv.service.ts
import { XMLParser, XMLValidator } from 'fast-xml-parser';

const ARXIV_API_BASE_URL = process.env.NEXT_PUBLIC_ARXIV_API_BASE_URL;

interface ArxivSearchParams {
  query: string; // Search query, e.g., "cat:cs.AI+AND+all:electron"
  maxResults?: number;
  sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate'; // arXiv uses 'submittedDate', 'lastUpdatedDate', 'relevance'
  sortOrder?: 'ascending' | 'descending';
  start?: number; // For pagination
}

interface ArxivPaper {
  id: string; // Entry ID URL (e.g., http://arxiv.org/abs/1708.08021v1)
  title: string;
  authors: string[]; // Array of author names
  summary: string; // Abstract
  publishedDate: string; // ISO 8601 string
  updatedDate: string; // ISO 8601 string
  pdfLink?: string; // Link to the PDF
  categories: string[]; // Array of category terms
  primaryCategory?: string;
}

// Helper to safely get array of authors
const getAuthors = (entry: any): string[] => {
  if (!entry.author) return [];
  if (Array.isArray(entry.author)) {
    return entry.author.map((auth: any) => (typeof auth === 'string' ? auth : auth.name)).filter(Boolean);
  }
  return [typeof entry.author === 'string' ? entry.author : entry.author.name].filter(Boolean);
};

// Helper to safely get array of categories
const getCategories = (entry: any): string[] => {
  if (!entry.category) return [];
  if (Array.isArray(entry.category)) {
    return entry.category.map((cat: any) => cat.$.term).filter(Boolean);
  }
  return [entry.category.$.term].filter(Boolean);
};

/**
 * Searches the arXiv API for papers.
 * Note: arXiv API typically returns XML, so parsing logic will be needed.
 *
 * @param params - Search parameters for arXiv.
 * @returns A promise that resolves to an array of ArxivPaper objects.
 */
export async function searchArxiv(params: ArxivSearchParams): Promise<ArxivPaper[]> {
  if (!ARXIV_API_BASE_URL) {
    console.error('ARXIV_API_BASE_URL is not configured.');
    throw new Error('arXiv API base URL not configured.');
  }

  const queryParams = new URLSearchParams({
    search_query: params.query,
    max_results: (params.maxResults || 10).toString(),
    start: (params.start || 0).toString(),
    sortBy: params.sortBy || 'relevance',
    sortOrder: params.sortOrder || 'descending',
  });

  const url = `${ARXIV_API_BASE_URL}query?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`arXiv API request failed with status ${response.status}: ${await response.text()}`);
    }
    const xmlData = await response.text();

    if (!XMLValidator.validate(xmlData)) {
        console.error("Invalid XML response from arXiv", xmlData);
        throw new Error("Invalid XML response from arXiv");
    }

    const parser = new XMLParser({
      ignoreAttributes: false, // Important for category terms
      attributeNamePrefix : "$", // Default prefix for attributes
      allowBooleanAttributes: true,
      parseTagValue: true,
      parseAttributeValue: true,
      trimValues: true,
      isArray: (name, jpath, isLeafNode, isAttribute) => { 
        // Tell the parser that <entry>, <author>, <link>, and <category> can be arrays
        return ['feed.entry', 'feed.entry.author', 'feed.entry.link', 'feed.entry.category'].indexOf(jpath) !== -1;
      }
    });
    const result = parser.parse(xmlData);

    const entries = result.feed?.entry || [];
    if (!Array.isArray(entries)) {
      // If only one entry, it might not be an array
      const singlePaper = mapArxivEntryToPaper(entries);
      return singlePaper ? [singlePaper] : [];
    }

    return entries.map(mapArxivEntryToPaper).filter((paper): paper is ArxivPaper => paper !== null);

  } catch (error) {
    console.error('Error searching arXiv:', error);
    // Depending on desired error handling, you might re-throw, or return empty array, or a custom error object
    throw error; // Re-throw for the caller to handle
  }
}

function mapArxivEntryToPaper(entry: any): ArxivPaper | null {
  if (!entry || !entry.id) return null;

  const authors = getAuthors(entry);
  const categories = getCategories(entry);
  const pdfLink = (Array.isArray(entry.link) ? entry.link.find((l: any) => l.$.title === 'pdf')?.$.href : (entry.link.$.title === 'pdf' ? entry.link.$.href : undefined));

  return {
    id: typeof entry.id === 'string' ? entry.id : '', // Ensure id is a string
    title: typeof entry.title === 'string' ? entry.title.replace(/\s*\n\s*/g, ' ') : 'No title',
    authors,
    summary: typeof entry.summary === 'string' ? entry.summary.replace(/\s*\n\s*/g, ' ') : 'No summary',
    publishedDate: typeof entry.published === 'string' ? entry.published : '',
    updatedDate: typeof entry.updated === 'string' ? entry.updated : '',
    pdfLink,
    categories,
    primaryCategory: entry['arxiv:primary_category']?.$.term || undefined,
  };
} 