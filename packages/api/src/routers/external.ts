import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// arXiv API types
interface ArxivEntry {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  updated: string;
  link: string;
  pdf_url: string;
}

interface ArxivResponse {
  feed: {
    entry: ArxivEntry[];
  };
}

// Semantic Scholar API types
interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract: string;
  authors: Array<{ name: string }>;
  year: number;
  url: string;
  openAccessPdf?: { url: string };
}

interface SemanticScholarResponse {
  data: SemanticScholarPaper[];
}

// CrossRef API types
interface CrossRefWork {
  DOI: string;
  title: string[];
  abstract: string;
  author: Array<{ given: string; family: string }>;
  published: { 'date-parts': number[][] };
  URL: string;
}

interface CrossRefResponse {
  message: {
    items: CrossRefWork[];
  };
}

export const externalRouter = router({
  // Search arXiv for research papers
  searchArxiv: publicProcedure
    .input(z.object({
      query: z.string().min(1, 'Search query is required'),
      limit: z.number().min(1).max(50).optional().default(10),
      sortBy: z.enum(['relevance', 'lastUpdatedDate', 'submittedDate']).optional().default('relevance'),
      sortOrder: z.enum(['ascending', 'descending']).optional().default('descending'),
    }))
    .output(z.object({
      results: z.array(z.object({
        id: z.string(),
        title: z.string(),
        abstract: z.string(),
        authors: z.array(z.string()),
        published: z.string(),
        updated: z.string(),
        url: z.string(),
        pdf_url: z.string(),
        source: z.literal('arxiv'),
      })),
      total: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const { query, limit, sortBy, sortOrder } = input;
        
        // Build arXiv API URL
        const baseUrl = 'http://export.arxiv.org/api/query';
        const params = new URLSearchParams({
          search_query: `all:${encodeURIComponent(query)}`,
          start: '0',
          max_results: limit.toString(),
          sortBy: sortBy === 'relevance' ? 'relevance' : sortBy === 'lastUpdatedDate' ? 'lastUpdatedDate' : 'submittedDate',
          sortOrder: sortOrder,
        });
        
        const response = await fetch(`${baseUrl}?${params}`);
        
        if (!response.ok) {
          throw new Error(`arXiv API error: ${response.status}`);
        }
        
        const xmlText = await response.text();
        
        // Parse XML response (simplified - in production, use a proper XML parser)
        const entries = parseArxivXML(xmlText);
        
        return {
          results: entries.slice(0, limit).map(entry => ({
            id: entry.id,
            title: entry.title,
            abstract: entry.summary,
            authors: entry.authors,
            published: entry.published,
            updated: entry.updated,
            url: entry.link,
            pdf_url: entry.pdf_url,
            source: 'arxiv' as const,
          })),
          total: entries.length,
        };
      } catch (error) {
        console.error('arXiv search error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search arXiv',
        });
      }
    }),

  // Search Semantic Scholar
  searchSemanticScholar: publicProcedure
    .input(z.object({
      query: z.string().min(1, 'Search query is required'),
      limit: z.number().min(1).max(50).optional().default(10),
      year: z.number().optional(),
    }))
    .output(z.object({
      results: z.array(z.object({
        id: z.string(),
        title: z.string(),
        abstract: z.string(),
        authors: z.array(z.string()),
        year: z.number().optional(),
        url: z.string(),
        pdf_url: z.string().optional(),
        source: z.literal('semantic_scholar'),
      })),
      total: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const { query, limit, year } = input;
        
        // Build Semantic Scholar API URL
        const baseUrl = 'https://api.semanticscholar.org/graph/v1/paper/search';
        const params = new URLSearchParams({
          query: query,
          limit: limit.toString(),
          fields: 'title,abstract,authors,year,url,openAccessPdf',
        });
        
        if (year) {
          params.append('year', year.toString());
        }
        
        const response = await fetch(`${baseUrl}?${params}`);
        
        if (!response.ok) {
          throw new Error(`Semantic Scholar API error: ${response.status}`);
        }
        
        const data: SemanticScholarResponse = await response.json();
        
        return {
          results: data.data.map(paper => ({
            id: paper.paperId,
            title: paper.title,
            abstract: paper.abstract || '',
            authors: paper.authors.map(author => author.name),
            year: paper.year,
            url: paper.url,
            pdf_url: paper.openAccessPdf?.url,
            source: 'semantic_scholar' as const,
          })),
          total: data.data.length,
        };
      } catch (error) {
        console.error('Semantic Scholar search error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search Semantic Scholar',
        });
      }
    }),

  // Search CrossRef
  searchCrossRef: publicProcedure
    .input(z.object({
      query: z.string().min(1, 'Search query is required'),
      limit: z.number().min(1).max(50).optional().default(10),
    }))
    .output(z.object({
      results: z.array(z.object({
        id: z.string(),
        title: z.string(),
        abstract: z.string(),
        authors: z.array(z.string()),
        year: z.number().optional(),
        url: z.string(),
        doi: z.string(),
        source: z.literal('crossref'),
      })),
      total: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const { query, limit } = input;
        
        // Build CrossRef API URL
        const baseUrl = 'https://api.crossref.org/works';
        const params = new URLSearchParams({
          query: query,
          rows: limit.toString(),
          select: 'DOI,title,abstract,author,published,URL',
        });
        
        const response = await fetch(`${baseUrl}?${params}`);
        
        if (!response.ok) {
          throw new Error(`CrossRef API error: ${response.status}`);
        }
        
        const data: CrossRefResponse = await response.json();
        
        return {
          results: data.message.items.map(work => ({
            id: work.DOI,
            title: work.title?.[0] || 'Untitled',
            abstract: work.abstract || '',
            authors: work.author?.map(author => `${author.given} ${author.family}`) || [],
            year: work.published?.['date-parts']?.[0]?.[0],
            url: work.URL,
            doi: work.DOI,
            source: 'crossref' as const,
          })),
          total: data.message.items.length,
        };
      } catch (error) {
        console.error('CrossRef search error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search CrossRef',
        });
      }
    }),

  // Unified search across multiple sources
  searchAll: publicProcedure
    .input(z.object({
      query: z.string().min(1, 'Search query is required'),
      limit: z.number().min(1).max(50).optional().default(10),
      sources: z.array(z.enum(['arxiv', 'semantic_scholar', 'crossref'])).optional().default(['arxiv', 'semantic_scholar']),
    }))
    .output(z.object({
      results: z.array(z.object({
        id: z.string(),
        title: z.string(),
        abstract: z.string(),
        authors: z.array(z.string()),
        year: z.number().optional(),
        url: z.string(),
        pdf_url: z.string().optional(),
        doi: z.string().optional(),
        source: z.enum(['arxiv', 'semantic_scholar', 'crossref']),
      })),
      total: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const { query, limit, sources } = input;
        const results: any[] = [];
        
        // Search each source in parallel
        const searchPromises = sources.map(async (source) => {
          try {
            const sourceLimit = Math.ceil(limit / sources.length);
            
            switch (source) {
              case 'arxiv':
                const arxivResult = await fetch(`http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${sourceLimit}&sortBy=relevance&sortOrder=descending`);
                if (arxivResult.ok) {
                  const xmlText = await arxivResult.text();
                  const entries = parseArxivXML(xmlText);
                  return entries.map(entry => ({
                    id: entry.id,
                    title: entry.title,
                    abstract: entry.summary,
                    authors: entry.authors,
                    published: entry.published,
                    updated: entry.updated,
                    url: entry.link,
                    pdf_url: entry.pdf_url,
                    source: 'arxiv' as const,
                  }));
                }
                break;
                
              case 'semantic_scholar':
                const ssResult = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${sourceLimit}&fields=title,abstract,authors,year,url,openAccessPdf`);
                if (ssResult.ok) {
                  const data: SemanticScholarResponse = await ssResult.json();
                  return data.data.map(paper => ({
                    id: paper.paperId,
                    title: paper.title,
                    abstract: paper.abstract || '',
                    authors: paper.authors.map(author => author.name),
                    year: paper.year,
                    url: paper.url,
                    pdf_url: paper.openAccessPdf?.url,
                    source: 'semantic_scholar' as const,
                  }));
                }
                break;
                
              case 'crossref':
                const crResult = await fetch(`https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${sourceLimit}&select=DOI,title,abstract,author,published,URL`);
                if (crResult.ok) {
                  const data: CrossRefResponse = await crResult.json();
                  return data.message.items.map(work => ({
                    id: work.DOI,
                    title: work.title?.[0] || 'Untitled',
                    abstract: work.abstract || '',
                    authors: work.author?.map(author => `${author.given} ${author.family}`) || [],
                    year: work.published?.['date-parts']?.[0]?.[0],
                    url: work.URL,
                    doi: work.DOI,
                    source: 'crossref' as const,
                  }));
                }
                break;
            }
          } catch (error) {
            console.error(`Error searching ${source}:`, error);
          }
          return [];
        });
        
        const searchResults = await Promise.all(searchPromises);
        
        // Combine and deduplicate results
        const allResults = searchResults.flat();
        const uniqueResults = deduplicateResults(allResults);
        
        return {
          results: uniqueResults.slice(0, limit),
          total: uniqueResults.length,
        };
      } catch (error) {
        console.error('Unified search error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to perform unified search',
        });
      }
    }),

  // Legacy CORE search (kept for backward compatibility)
  searchCore: publicProcedure
    .input(z.object({
      query: z.string().min(1, 'Search query is required'),
      limit: z.number().min(1).max(50).optional().default(10),
    }))
    .output(z.object({
      results: z.array(z.object({
        id: z.string(),
        title: z.string(),
        authors: z.array(z.string()).optional(),
        abstract: z.string().optional().nullable(),
        yearPublished: z.number().optional(),
        doi: z.string().optional().nullable(),
        downloadUrl: z.string().optional(),
        sourceFulltextUrls: z.array(z.string()).optional(),
        publisher: z.string().optional().nullable(),
      })),
    }))
    .query(async ({ input }) => {
      // For now, return mock data until CORE API is integrated
      console.log(`[CORE Search] Query: ${input.query}, Limit: ${input.limit}`);

      const mockResults = [
        {
          id: `core-${Date.now()}-1`,
          title: `Research Paper on ${input.query}`,
          authors: ['Dr. Jane Smith', 'Prof. John Doe'],
          abstract: `This paper presents an innovative approach to ${input.query}, demonstrating significant improvements in performance and efficiency.`,
          yearPublished: 2024,
          doi: `10.1000/mock.${input.query.replace(/\s+/g, '').toLowerCase()}`,
          downloadUrl: `https://core.ac.uk/download/pdf/${input.query.replace(/\s+/g, '-').toLowerCase()}.pdf`,
          sourceFulltextUrls: [`https://core.ac.uk/display/${input.query.replace(/\s+/g, '-').toLowerCase()}`],
          publisher: 'Academic Journal of Research',
        },
        {
          id: `core-${Date.now()}-2`,
          title: `Comprehensive Study of ${input.query} Applications`,
          authors: ['Dr. Alice Johnson', 'Dr. Bob Wilson'],
          abstract: `A comprehensive review of ${input.query} applications across various domains. This study analyzes current trends and challenges.`,
          yearPublished: 2023,
          doi: `10.1000/mock.${input.query.replace(/\s+/g, '').toLowerCase()}.2`,
          downloadUrl: `https://core.ac.uk/download/pdf/${input.query.replace(/\s+/g, '-').toLowerCase()}-2.pdf`,
          sourceFulltextUrls: [`https://core.ac.uk/display/${input.query.replace(/\s+/g, '-').toLowerCase()}-2`],
          publisher: 'International Science Review',
        },
      ];

      return {
        results: mockResults.slice(0, input.limit),
      };
    }),
});

// Helper function to parse arXiv XML response (simplified)
function parseArxivXML(xmlText: string): ArxivEntry[] {
  const entries: ArxivEntry[] = [];
  
  // Simple regex-based parsing (in production, use a proper XML parser)
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  
  while ((match = entryRegex.exec(xmlText)) !== null) {
    const entryXml = match[1];
    
    const idMatch = entryXml.match(/<id>(.*?)<\/id>/);
    const titleMatch = entryXml.match(/<title>(.*?)<\/title>/);
    const summaryMatch = entryXml.match(/<summary>(.*?)<\/summary>/);
    const publishedMatch = entryXml.match(/<published>(.*?)<\/published>/);
    const updatedMatch = entryXml.match(/<updated>(.*?)<\/updated>/);
    const linkMatch = entryXml.match(/<link[^>]*href="([^"]*)"[^>]*>/);
    const pdfMatch = entryXml.match(/<link[^>]*title="pdf"[^>]*href="([^"]*)"[^>]*>/);
    
    const authors: string[] = [];
    const authorRegex = /<name>(.*?)<\/name>/g;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(entryXml)) !== null) {
      authors.push(authorMatch[1]);
    }
    
    if (idMatch && titleMatch) {
      entries.push({
        id: idMatch[1],
        title: titleMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'),
        summary: summaryMatch?.[1]?.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') || '',
        authors,
        published: publishedMatch?.[1] || '',
        updated: updatedMatch?.[1] || '',
        link: linkMatch?.[1] || '',
        pdf_url: pdfMatch?.[1] || '',
      });
    }
  }
  
  return entries;
}

// Helper function to deduplicate search results
function deduplicateResults(results: any[]): any[] {
  const seen = new Set<string>();
  return results.filter(result => {
    const key = `${result.source}-${result.id}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
 
 