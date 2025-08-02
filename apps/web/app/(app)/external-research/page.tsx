'use client';

import React, { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox'; // Assuming you have a Checkbox component
import { Label } from '@/components/ui/Label'; // Assuming you have a Label component
import { FiSearch, FiLoader, FiAlertCircle, FiBookOpen } from 'react-icons/fi';
import { api } from '@/lib/trpc';

type ApiSource = 'arxiv' | 'semanticScholar' | 'crossref' | 'pubmed' | 'core';

const availableSources: { id: ApiSource; name: string }[] = [
  { id: 'arxiv', name: 'arXiv' },
  { id: 'semanticScholar', name: 'Semantic Scholar' },
  { id: 'crossref', name: 'CrossRef' },
];

export default function ExternalResearchPage() {
  const [searchQuery, setSearchQuery] = useState('AI');
  const [submittedQuery, setSubmittedQuery] = useState('AI');
  const [selectedSources, setSelectedSources] = useState<ApiSource[]>(['arxiv', 'semanticScholar']); // Default selection
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use tRPC APIs for external search
  const unifiedQuery = api.external.searchAll.useQuery(
    { 
      query: submittedQuery, 
      limit: 20, 
      sources: selectedSources.map(s => s === 'semanticScholar' ? 'semantic_scholar' : s) as any
    },
    { enabled: !!submittedQuery }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
  };

  // Get results from unified search
  const papers = useMemo(() => {
    if (!unifiedQuery.data || !Array.isArray(unifiedQuery.data.results)) {
      return [];
    }
    return unifiedQuery.data.results;
  }, [unifiedQuery.data]);

  const handleSourceChange = (sourceId: ApiSource) => {
    setSelectedSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(s => s !== sourceId)
        : [...prev, sourceId]
    );
  };

  // Basic styling classes - can be refined with Tamagui or specific CSS
  const commonLabelClass = "block text-sm font-medium text-neutral-300 mb-1.5 font-sans";
  const inputBaseClass = "flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50 font-sans";

  return (
    <PageContainer title="External Research Discovery" className="bg-black min-h-screen text-neutral-100 font-sans">
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <FiBookOpen className="text-5xl text-accent-purple mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-heading text-neutral-100">
            Discover External Research
          </h1>
          <p className="text-neutral-400 mt-2 text-base font-sans">
            Search across multiple academic databases and open access repositories.
          </p>
        </header>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl p-6 mb-8">
          <div className="mb-4">
            <Label htmlFor="searchQuery" className={commonLabelClass}>Search Query</Label>
            <Input
              id="searchQuery"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter keywords, title, author, DOI, etc."
              className={inputBaseClass}
            />
          </div>

          <div className="mb-6">
            <Label className={commonLabelClass}>Data Sources</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {availableSources.map(source => (
                <div key={source.id} className="flex items-center space-x-2 bg-neutral-800/50 p-3 rounded-md border border-neutral-700 hover:border-accent-purple transition-colors">
                  <Checkbox
                    id={`source-${source.id}`}
                    checked={selectedSources.includes(source.id)}
                    onCheckedChange={() => handleSourceChange(source.id)}
                    className="border-neutral-600 data-[state=checked]:bg-accent-purple data-[state=checked]:border-accent-purple"
                  />
                  <Label htmlFor={`source-${source.id}`} className="text-sm font-sans text-neutral-200 cursor-pointer">
                    {source.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full font-sans bg-accent-purple hover:bg-accent-purple/90 text-white focus-visible:ring-accent-purple/80"
          >
            {isLoading ? (
              <><FiLoader className="animate-spin mr-2" /> Searching...</>
            ) : (
              <><FiSearch className="mr-2" /> Search Databases</>
            )}
          </Button>
        </div>

        {error && (
          <div className="my-6 p-4 bg-red-900/30 border border-red-700/50 rounded-md text-red-300 text-sm flex items-start space-x-2.5 font-sans">
            <FiAlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-400" />
            <div>
              <h5 className="font-semibold mb-0.5 font-heading">Search Error</h5>
              <span>{error}</span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-10">
            <FiLoader className="animate-spin text-accent-purple text-5xl mx-auto mb-4" />
            <p className="text-neutral-400 font-sans">Fetching results from external sources...</p>
          </div>
        )}

        {!isLoading && papers.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading text-neutral-100 mb-4">Search Results ({papers.length})</h2>
            {papers.map((paper) => (
              <div key={paper.id} className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg p-5 hover:border-neutral-700 transition-colors">
                <h3 className="text-lg font-semibold font-heading text-accent-purple mb-1">{paper.title}</h3>
                {paper.abstract && (
                  <p className="text-sm text-neutral-400 mb-3 line-clamp-3 font-sans">{paper.abstract}</p>
                )}
                <div className="flex flex-wrap gap-3 items-center">
                  {paper.pdf_url && (
                    <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" className="text-sm font-sans text-green-400 hover:text-green-300 hover:underline transition-colors">
                      Download PDF
                    </a>
                  )}
                  {paper.doi && (
                    <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="text-sm font-sans text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                      View DOI
                    </a>
                  )}
                  <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-sm font-sans text-accent-purple hover:text-accent-purple/80 hover:underline transition-colors">
                    View Paper
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!isLoading && !error && papers.length === 0 && searchQuery && (
             <div className="text-center py-12">
                <FiBookOpen className="mx-auto text-6xl text-neutral-600 mb-4" />
                <h2 className="text-xl font-heading text-neutral-300 mb-2">No Results Found</h2>
                <p className="text-neutral-500 font-sans">Try adjusting your search query or selecting different data sources.</p>
            </div>
        )}
      </div>
    </PageContainer>
  );
} 
 
 
 