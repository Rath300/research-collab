'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FiSearch, FiExternalLink, FiDownload, FiBookOpen, FiFileText, FiCalendar, FiUser, FiLoader, FiFilter } from 'react-icons/fi';
import { api } from '@/lib/trpc';

interface SearchResult {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  year?: number;
  url: string;
  pdf_url?: string;
  doi?: string;
  source: 'arxiv' | 'semantic_scholar' | 'crossref';
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'arxiv' | 'semantic_scholar' | 'crossref'>('all');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  // Search queries
  const arxivSearch = api.external.searchArxiv.useQuery(
    { query, limit: 10 },
    { enabled: false }
  );

  const semanticScholarSearch = api.external.searchSemanticScholar.useQuery(
    { query, limit: 10, year: yearFilter ? parseInt(yearFilter) : undefined },
    { enabled: false }
  );

  const crossrefSearch = api.external.searchCrossRef.useQuery(
    { query, limit: 10 },
    { enabled: false }
  );

  const unifiedSearch = api.external.searchAll.useQuery(
    { 
      query, 
      limit: 20, 
      sources: searchType === 'all' ? ['arxiv', 'semantic_scholar', 'crossref'] : [searchType]
    },
    { enabled: false }
  );

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      if (searchType === 'all') {
        await unifiedSearch.refetch();
      } else if (searchType === 'arxiv') {
        await arxivSearch.refetch();
      } else if (searchType === 'semantic_scholar') {
        await semanticScholarSearch.refetch();
      } else if (searchType === 'crossref') {
        await crossrefSearch.refetch();
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getSearchResults = (): SearchResult[] => {
    if (searchType === 'all' && unifiedSearch.data) {
      return unifiedSearch.data.results;
    } else if (searchType === 'arxiv' && arxivSearch.data) {
      return arxivSearch.data.results;
    } else if (searchType === 'semantic_scholar' && semanticScholarSearch.data) {
      return semanticScholarSearch.data.results;
    } else if (searchType === 'crossref' && crossrefSearch.data) {
      return crossrefSearch.data.results;
    }
    return [];
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'arxiv': return <FiFileText className="h-4 w-4" />;
      case 'semantic_scholar': return <FiBookOpen className="h-4 w-4" />;
      case 'crossref': return <FiExternalLink className="h-4 w-4" />;
      default: return <FiFileText className="h-4 w-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'arxiv': return 'bg-orange-100 text-orange-800';
      case 'semantic_scholar': return 'bg-blue-100 text-blue-800';
      case 'crossref': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const results = getSearchResults();
  const isLoading = isSearching || unifiedSearch.isLoading || arxivSearch.isLoading || semanticScholarSearch.isLoading || crossrefSearch.isLoading;

  return (
    <PageContainer title="Research Search">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">Research Search</h1>
          <p className="text-neutral-400">
            Search across multiple academic databases including arXiv, Semantic Scholar, and CrossRef
          </p>
        </div>

        {/* Search Form */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter your research query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!query.trim() || isLoading}
                className="px-6"
              >
                {isLoading ? (
                  <FiLoader className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FiSearch className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <FiFilter className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-400">Source:</span>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="bg-neutral-800 border border-neutral-700 rounded px-3 py-1 text-sm text-neutral-200"
                >
                  <option value="all">All Sources</option>
                  <option value="arxiv">arXiv</option>
                  <option value="semantic_scholar">Semantic Scholar</option>
                  <option value="crossref">CrossRef</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-400">Year:</span>
                <Input
                  type="number"
                  placeholder="2020"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-20"
                  min="1900"
                  max="2024"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-2 text-neutral-400">
              <FiLoader className="h-5 w-5 animate-spin" />
              Searching...
            </div>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-100">
                Search Results ({results.length})
              </h2>
            </div>

            <div className="grid gap-4">
              {results.map((result, index) => (
                <motion.div
                  key={`${result.source}-${result.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:bg-neutral-800/50 transition-colors">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-neutral-100 mb-2 line-clamp-2">
                            {result.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-neutral-400">
                            <Badge className={getSourceColor(result.source)}>
                              {getSourceIcon(result.source)}
                              <span className="ml-1 capitalize">{result.source.replace('_', ' ')}</span>
                            </Badge>
                            {result.year && (
                              <div className="flex items-center gap-1">
                                <FiCalendar className="h-3 w-3" />
                                {result.year}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Authors */}
                      {result.authors.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-neutral-400">
                          <FiUser className="h-3 w-3" />
                          <span>{result.authors.slice(0, 3).join(', ')}</span>
                          {result.authors.length > 3 && (
                            <span>+{result.authors.length - 3} more</span>
                          )}
                        </div>
                      )}

                      {/* Abstract */}
                      {result.abstract && (
                        <p className="text-neutral-300 text-sm line-clamp-3">
                          {result.abstract}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(result.url, '_blank')}
                        >
                          <FiExternalLink className="h-3 w-3 mr-1" />
                          View Paper
                        </Button>
                        
                        {result.pdf_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(result.pdf_url, '_blank')}
                          >
                            <FiDownload className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        )}

                        {result.doi && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`https://doi.org/${result.doi}`, '_blank')}
                          >
                            DOI
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && query && results.length === 0 && (
          <div className="text-center py-12">
            <div className="text-neutral-400">
              <FiSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No results found for "{query}"</p>
              <p className="text-sm mt-2">Try adjusting your search terms or filters</p>
            </div>
          </div>
        )}

        {!query && !isLoading && (
          <div className="text-center py-12">
            <div className="text-neutral-400">
              <FiSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Enter a search query to find research papers</p>
              <p className="text-sm mt-2">Search across arXiv, Semantic Scholar, and CrossRef</p>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
} 


 
 


