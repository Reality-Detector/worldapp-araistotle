"use client";
import { useState } from "react";
import { useFactCheckClient } from '@/utils/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { useFactCheck } from '@/components/FactCheckProvider/factcheck-context';

export const BottomSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { extractClaim, factCheckSync } = useFactCheckClient();
  const { accessToken } = useAuth();
  const { setResults } = useFactCheck();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || searchQuery.trim().length === 0) return;

    setLoading(true);
    setMessage('Starting claim extraction...');

    try {
      const extractPayload = {
        query: searchQuery.trim(),
        timestamp: false,
        claim_extraction: true
      };

      const extractRes = await extractClaim(extractPayload);

      if (!extractRes.success) {
        console.error('extract-claim failed', extractRes.error);
        setMessage(`Extraction failed: ${extractRes.error}`);
        setLoading(false);
        return;
      }

      setMessage('Claims extracted — running fact-checks...');

      const claims = extractRes.data?.claims || [];
      if (!claims.length) {
        console.log('No claims returned from extract-claim', extractRes.data);
        setMessage('No claims found for the query.');
        setLoading(false);
        return;
      }

      // Run fact-check-sync for each claim sequentially (can be parallelized)
  const accumulated: any[] = [];
  for (const claim of claims) {
        const claimText = typeof claim === 'string' ? claim : claim?.text || claim?.claim || '';

        const body = {
          deployment_mode: 'frontend2',
          is_longcheck: false,
          location: 'location',
          mode: 'sync',
          query: claimText || searchQuery,
          requester_url: 'https://araistotle.facticity.ai',
          source: '',
          source_find_mode: false,
          speaker: claim?.speaker || 'speaker',
          timeout: 120,
          timestamp: new Date().toISOString(),
          userEmail: { address: (accessToken ? undefined : 'anonymous') },
          version: 'basic'
        };

        const fcRes = await factCheckSync(body);
        if (fcRes.success) {
          accumulated.push({ claim: claimText, result: fcRes.data });
        } else {
          accumulated.push({ claim: claimText, error: fcRes.error, status: fcRes.status });
        }
        // push current accumulated results so the UI can show progress
        setResults([...accumulated]);
      }
      setMessage('Fact-checking complete. Results shown above.');
    } catch (err) {
      console.error('Error during fact-check flow', err);
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-200 shadow-lg z-20">
      <div className="p-4 pb-6">
        <form onSubmit={handleSearch} className="flex items-center space-x-3">
          {/* Search Icon */}
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a claim or paste a youtube, tiktok, instagram, or apple podcasts link..."
            className="flex-1 px-4 py-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-blue-50 placeholder-gray-500"
          />
          
          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white p-4 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
          >
            {loading ? (
              <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </form>
        {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
};
