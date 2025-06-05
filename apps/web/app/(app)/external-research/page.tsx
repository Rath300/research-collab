'use client';

import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox'; // Assuming you have a Checkbox component
import { Label } from '@/components/ui/Label'; // Assuming you have a Label component
import {
  searchArxiv,
  searchSemanticScholar,
  searchCrossref,
  searchPubmed,
  searchCore,
  type ExternalSearchQuery,
  type UnifiedSearchResultItem,
} from '@/lib/external-apis'; // Adjust path as necessary
import { FiSearch, FiLoader, FiAlertCircle, FiBookOpen } from 'react-icons/fi';

type ApiSource = 'arxiv' | 'semanticScholar' | 'crossref' | 'pubmed' | 'core';

const availableSources: { id: ApiSource; name: string }[] = [
  { id: 'arxiv', name: 'arXiv' },
  { id: 'semanticScholar', name: 'Semantic Scholar' },
  { id: 'crossref', name: 'CrossRef' },
  { id: 'pubmed', name: 'PubMed' },
  { id: 'core', name: 'CORE' },
];

export default function ExternalResearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<ApiSource[]>(['arxiv', 'semanticScholar']); // Default selection
  const [results, setResults] = useState<UnifiedSearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query.');
      return;
    }
    if (selectedSources.length === 0) {
      setError('Please select at least one data source.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    const query: ExternalSearchQuery = {
      searchText: searchQuery,
      sources: selectedSources,
      maxResultsPerSource: 10, // Default for now
    };

    try {
      // This is where the conceptual aggregator function would be great.
      // For now, we'll call services individually and combine results (using placeholder data).
      let combinedResults: UnifiedSearchResultItem[] = [];

      // Simulating calls and combining mock data
      if (selectedSources.includes('arxiv')) {
        const arxivRes = await searchArxiv({ query: searchQuery });
        combinedResults = combinedResults.concat(
          arxivRes.map(p => ({ 
            source: 'arXiv', 
            id: p.id,
            title: p.title,
            authors: p.authors, // Directly use the string array
            abstract: p.summary,
            url: p.id, // arXiv entry URL can serve as the main URL
            pdfUrl: p.pdfLink,
            publishedDate: p.publishedDate 
          }))
        );
      }
      if (selectedSources.includes('semanticScholar')) {
        const s2Res = await searchSemanticScholar({ query: searchQuery });
        combinedResults = combinedResults.concat(
          s2Res.map(p => ({ ...p, id: p.paperId, source: 'Semantic Scholar', authors: p.authors?.map(a => a.name) || [] }))
        );
      }
      // ... Add similar blocks for CrossRef, PubMed, CORE using their respective search functions and mappers
      // For now, these will use the placeholder data from their service files.
      if (selectedSources.includes('core')) {
        const coreRes = await searchCore({ query: searchQuery });
        combinedResults = combinedResults.concat(
          coreRes.map(p => ({ ...p, source: 'CORE', authors: p.authors?.map(a => a.name) || [], pdfUrl: p.downloadUrl }))
        );
      }
       if (selectedSources.includes('crossref')) {
        const crossrefRes = await searchCrossref({ query: searchQuery });
        combinedResults = combinedResults.concat(
          crossrefRes.map(p => ({ id: p.DOI, source: 'CrossRef', title: p.title[0], authors: p.authors?.map(a => `${a.given} ${a.family}`.trim()) || [], url: p.URL }))
        );
      }
      if (selectedSources.includes('pubmed')) {
        const pubmedRes = await searchPubmed({ term: searchQuery });
        combinedResults = combinedResults.concat(
          pubmedRes.map(p => ({ id: p.uid, source: 'PubMed', title: p.title, authors: p.authors?.map(a => a.name) || [], abstract: p.abstract, url: `https://pubmed.ncbi.nlm.nih.gov/${p.uid}/` }))
        );
      }


      setResults(combinedResults);
      if (combinedResults.length === 0) {
        setError('No results found for your query.');
      }

    } catch (err) {
      console.error('Search failed:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during search.');
    } finally {
      setIsLoading(false);
    }
  };

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

        {!isLoading && results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading text-neutral-100 mb-4">Search Results ({results.length})</h2>
            {results.map((item, index) => (
              <div key={`${item.source}-${item.id}-${index}`} className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg p-5 hover:border-neutral-700 transition-colors">
                <h3 className="text-lg font-semibold font-heading text-accent-purple mb-1">{item.title}</h3>
                <p className="text-xs text-neutral-500 mb-2 font-sans">Source: <span className="font-medium text-neutral-400">{item.source}</span> {item.publishedDate && `• Published: ${item.publishedDate}`}</p>
                {item.authors && item.authors.length > 0 && (
                  <p className="text-sm text-neutral-300 mb-2 font-sans">Authors: {item.authors.join(', ')}</p>
                )}
                {item.abstract && (
                  <p className="text-sm text-neutral-400 mb-3 line-clamp-3 font-sans">{item.abstract}</p>
                )}
                <div className="flex flex-wrap gap-3 items-center">
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-sans text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                      View on {item.source}
                    </a>
                  )}
                  {item.pdfUrl && (
                    <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-sans text-green-400 hover:text-green-300 hover:underline transition-colors">
                      Download PDF
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!isLoading && !error && results.length === 0 && searchQuery && (
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
 
 
 