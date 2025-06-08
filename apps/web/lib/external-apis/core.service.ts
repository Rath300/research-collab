// apps/web/lib/external-apis/core.service.ts
import { trpcClient } from '@/lib/trpc'; // Import the pre-configured tRPC client
import { type CorePaper, mapCoreResultToPaper } from './core.mapping'; // I'll move mapping logic to its own file

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
 * Searches the CORE API via our tRPC backend to avoid CORS issues.
 *
 * @param params - Search parameters for CORE API.
 * @returns A promise that resolves to an array of CorePaper objects.
 */
export async function searchCore(params: CoreSearchParams): Promise<CorePaper[]> {
  try {
    const result = await trpcClient.external.searchCore.query(params);
    
    // The result from tRPC is the raw API response. We still need to map it.
    const papers = result.results || [];
    if (!Array.isArray(papers)) {
        console.error("CORE API via tRPC did not return a results array or it's malformed", papers);
        return [];
    }
    
    return papers.map(mapCoreResultToPaper).filter((paper): paper is CorePaper => paper !== null);

  } catch (error) {
    console.error('Error searching CORE API via tRPC:', error);
    // Depending on how you want to handle errors, you might re-throw
    // or return an empty array.
    throw error;
  }
} 
 
 
 