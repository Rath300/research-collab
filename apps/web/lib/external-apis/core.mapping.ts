export interface CoreAuthor {
  name: string;
}

export interface CorePaper {
  id: string;
  title: string;
  authors?: CoreAuthor[];
  abstract?: string | null;
  yearPublished?: number;
  doi?: string | null;
  downloadUrl?: string;
  sourceFulltextUrls?: string[];
  publisher?: string | null;
}

export function mapCoreResultToPaper(result: any): CorePaper | null {
  if (!result || !result.id) return null;

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