"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../../hooks/useAuth";
import { getUserWeb3Data } from "../../utils/apiClient";
import { useCredits } from "../../components/CreditProvider";
import { useFactCheck } from '@/components/FactCheckProvider/factcheck-context';
import FactCheckFeedback from '../FactCheckFeedback';

export const HomeContent = () => {
  const [showMore, setShowMore] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [web3Data, setWeb3Data] = useState<any>(null);
  const [web3Loading, setWeb3Loading] = useState(false);
  const [web3Error, setWeb3Error] = useState<string | null>(null);
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());
  const [expandedDisambiguations, setExpandedDisambiguations] = useState<Set<string>>(new Set());
  const { user, isAuthenticated, isLoading, accessToken, session } = useAuth();
  const { creditData, isLoading: creditsLoading, error: creditsError, refetchCredits } = useCredits();
  const { results } = useFactCheck();

  // Helper functions for managing expanded results
  const toggleResult = (idx: number) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedResults(newExpanded);
  };

  const expandAllResults = () => {
    if (results) {
      setExpandedResults(new Set(results.map((_, idx) => idx)));
    }
  };

  const collapseAllResults = () => {
    setExpandedResults(new Set());
  };

  // Helper functions for managing disambiguation dropdowns
  const toggleDisambiguation = (disambiguationKey: string) => {
    const newExpanded = new Set(expandedDisambiguations);
    if (newExpanded.has(disambiguationKey)) {
      newExpanded.delete(disambiguationKey);
    } else {
      newExpanded.add(disambiguationKey);
    }
    setExpandedDisambiguations(newExpanded);
  };

  // Fetch Web3 data when user is authenticated
  useEffect(() => {
    const fetchWeb3Data = async () => {
      if (isAuthenticated && accessToken && !web3Loading && !web3Data) {
        setWeb3Loading(true);
        setWeb3Error(null);
        
        try {
          // For now, using a placeholder wallet_id - you may want to get this from user data
          const walletId = user?.name || 'default-wallet';
          console.log('Fetching Web3 data for wallet:', walletId);
          
          const result = await getUserWeb3Data(walletId, accessToken);
          
          if (result.success) {
            console.log('=== WEB3 DATA SUCCESS ===');
            console.log('Web3 data:', result.data);
            console.log('========================');
            setWeb3Data(result.data);
          } else {
            console.error('=== WEB3 DATA ERROR ===');
            console.error('Error fetching Web3 data:', result.error);
            console.error('Status:', result.status);
            console.error('=======================');
            setWeb3Error(result.error || 'Failed to fetch Web3 data');
          }
        } catch (error) {
          console.error('=== WEB3 DATA EXCEPTION ===');
          console.error('Exception fetching Web3 data:', error);
          console.error('===========================');
          setWeb3Error(error instanceof Error ? error.message : 'Unknown error occurred');
        } finally {
          setWeb3Loading(false);
        }
      }
    };

    fetchWeb3Data();
  }, [isAuthenticated, accessToken, web3Loading, web3Data, user?.name]);

  const handleLogUser = () => {
    console.log("=== DEBUG USER INFO ===");
    console.log("User object:", user);
    console.log("Is authenticated:", isAuthenticated);
    console.log("Is loading:", isLoading);
    console.log("Access token:", accessToken);
    console.log("Full session object:", session);
    console.log("Session keys:", session ? Object.keys(session) : "No session");
    console.log("=====================");
  };

  const handleFetchWeb3Data = async () => {
    if (!isAuthenticated || !accessToken) {
      console.error('User not authenticated or no access token');
      return;
    }

    setWeb3Loading(true);
    setWeb3Error(null);
    
    try {
      const walletId = user?.name || 'default-wallet';
      console.log('Manually fetching Web3 data for wallet:', walletId);
      
      const result = await getUserWeb3Data(walletId, accessToken);
      
      if (result.success) {
        console.log('=== WEB3 DATA SUCCESS (MANUAL) ===');
        console.log('Web3 data:', result.data);
        console.log('=================================');
        setWeb3Data(result.data);
      } else {
        console.error('=== WEB3 DATA ERROR (MANUAL) ===');
        console.error('Error fetching Web3 data:', result.error);
        console.error('Status:', result.status);
        console.error('================================');
        setWeb3Error(result.error || 'Failed to fetch Web3 data');
      }
    } catch (error) {
      console.error('=== WEB3 DATA EXCEPTION (MANUAL) ===');
      console.error('Exception fetching Web3 data:', error);
      console.error('===================================');
      setWeb3Error(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setWeb3Loading(false);
    }
  };

  return (
    <div className="px-4 pb-32 max-w-4xl mx-auto">
      {/* If results exist, hide banner/panels and show results */}
      {!results && showBanner && (
        <div className="bg-white border-2 border-blue-200 text-gray-800 p-5 rounded-xl mb-8 relative">
          <a 
            href="https://time.com/7094922/ai-seer-facticity-ai/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between hover:bg-blue-50 transition-all duration-200 rounded-lg p-3 -m-3 group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                <Image 
                  src="/timesBest.png" 
                  alt="TIME Best Inventions 2024" 
                  width={28} 
                  height={28}
                  className="flex-shrink-0"
                />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900 block">🏆 TIME&apos;s Best Inventions 2024</span>
                <span className="text-xs text-gray-600">Recognized as one of 14 groundbreaking AIs</span>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowBanner(false);
              }}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 p-2 rounded-full group-hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </a>
        </div>
      )}

      {!results && (
        <div className="bg-blue-50 rounded-xl p-6 mb-8 border-2 border-blue-200">
          <div className="flex items-start space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg border border-blue-300">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-blue-800 mb-0">About Facticity.AI</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-700 text-base leading-relaxed">
              Our <span className="font-semibold text-blue-700">multi-modal and multi-lingual fact-checker</span> can verify text claims and video URLs from social media platforms. 
              Try it out using the search bar below!
            </p>
            
            <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
              <p className="text-gray-700 text-sm leading-relaxed mb-2">
                <span className="font-medium text-blue-700">💰 Earn $FACY tokens</span> by helping us moderate the output of Facticity.AI
              </p>
              <p className="text-gray-600 text-sm">
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mr-2 border border-blue-200">
                  🤖 AI Fact-Checked
                </span>
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                  👥 Human Moderated
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowMore(!showMore)}
            className="mt-4 text-blue-700 text-sm font-semibold flex items-center space-x-2 hover:text-blue-800 hover:bg-blue-100 px-3 py-2 rounded-lg transition-all duration-200 group border border-blue-200"
          >
            <span>{showMore ? 'Show less' : 'Learn more'}</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${showMore ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showMore && (
            <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-200">
              <div className="space-y-3 text-gray-700 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Advanced AI technology that processes multiple content types including text, images, and videos</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Supports multiple languages for global fact-checking capabilities</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Community-driven moderation system with token rewards for contributors</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Credits Information Section */}
      {isAuthenticated && !results && (
        <div className="bg-purple-50 rounded-xl p-6 mb-8 border-2 border-purple-200">
          <h3 className="text-lg font-bold text-purple-800 mb-4">Your Credits</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={refetchCredits}
                disabled={creditsLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {creditsLoading ? 'Refreshing...' : 'Refresh Credits'}
              </button>
              
              {creditData && (
                <span className="text-purple-700 font-medium">✅ Credits loaded successfully</span>
              )}
              
              {creditsError && (
                <span className="text-red-700 font-medium">❌ Error: {creditsError}</span>
              )}
            </div>
            
            {creditData && (
              <div className="bg-white rounded-lg p-6 border border-purple-200">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Daily Credits - Gold Coin */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <Image 
                        src="/goldcoin.png" 
                        alt="Daily Credits" 
                        width={48} 
                        height={48}
                        className="flex-shrink-0"
                      />
                      <div>
                        <div className="text-3xl font-bold text-blue-800">{creditData.daily_credits}</div>
                        <div className="text-sm text-gray-600">Fact checking credits</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lifetime Credits - Teal Diamond */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <Image 
                        src="/diamond.png" 
                        alt="Lifetime Credits" 
                        width={48} 
                        height={48}
                        className="flex-shrink-0"
                      />
                      <div>
                        <div className="text-3xl font-bold text-blue-800">{creditData.lifetime_credits}</div>
                        <div className="text-sm text-gray-600">Points</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Credits Explanation */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-blue-700">Fact checking credits:</span> Used for performing fact checks (5 credits per fact check)
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-blue-700">Points:</span> Earned through in-app activities like providing feedback and moderation
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            )}
          
          </div>
        </div>
      )}

      {/* If fact-check results exist, render them */}
      {results && (
        <div className="bg-white rounded-xl p-6 mb-8 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Fact-check Results ({results.length})</h3>
            <div className="flex space-x-2">
              <button
                onClick={expandAllResults}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAllResults}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {results.map((r: any, idx: number) => {
              // Try to extract the 'final' field and latest 'verifying source' field from the result
              let finalObj: any = null;
              let verifyingSourceObj: any = null;
              let error = null;
              if (r.result && typeof r.result === 'string') {
                try {
                  const lines = r.result.split(/\n+/).filter(Boolean);
                  
                  // Find the final field
                  const finalLine = lines.reverse().find((line: string) => {
                    try {
                      const obj = JSON.parse(line);
                      return obj.final;
                    } catch { return false; }
                  });
                  
                  // Find the latest verifying source field
                  const verifyingSourceLine = lines.find((line: string) => {
                    try {
                      const obj = JSON.parse(line);
                      return obj['verifying source'] || obj.verifying_source;
                    } catch { return false; }
                  });
                  
                  if (finalLine) {
                    const obj = JSON.parse(finalLine);
                    finalObj = JSON.parse(obj.final);
                  }
                  
                  if (verifyingSourceLine) {
                    const obj = JSON.parse(verifyingSourceLine);
                    verifyingSourceObj = obj['verifying source'] || obj.verifying_source;
                  }
                } catch (e) {
                  error = e;
                }
              }
              // Helper to render a field if present
              const renderField = (label: string, value: any) => (
                value ? (
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700 mr-1">{label}:</span>
                    {typeof value === 'string' ? <span className="text-gray-800">{value}</span> : <pre className="inline text-xs text-gray-700">{JSON.stringify(value, null, 2)}</pre>}
                  </div>
                ) : null
              );
              // Extract sources and source summaries from the finalObj if present
              let sources: {title: string, url: string, summary?: string}[] = [];
              if (finalObj && Array.isArray(finalObj.sources)) {
                // If backend provides a sources array
                sources = finalObj.sources.map((src: any) => ({
                  title: src.title || src.source || src.url || 'Source',
                  url: src.url || src.link || '',
                  summary: src.summary || ''
                }));
              } else if (finalObj && typeof finalObj.overall_assessment === 'string') {
                // Fallback: extract from summary markdown links
                const linkRegex = /\[([^\]]+)\]\((https?:[^)]+)\)/g;
                let match;
                while ((match = linkRegex.exec(finalObj.overall_assessment)) !== null) {
                  sources.push({ title: match[1], url: match[2] });
                }
              }
              // Bias field: can be array or string
              // let bias = finalObj && finalObj.bias; // commented out
              // Disambiguation
              let disambiguation = finalObj && finalObj.disambiguation;
              // Timestamp
              let timestamp = finalObj && finalObj.timestamp;
              // VisualisationMode (user credits etc)
              // let visualisationMode = finalObj && finalObj.visualisationMode; // commented out
              // Task ID
              let taskId = finalObj && finalObj.task_id;
              // Fallback to taskId from FactCheckResult if not found in finalObj
              if (!taskId && r.taskId) {
                taskId = r.taskId;
              }
              // Format timestamp
              let formattedTimestamp = '';
              if (timestamp) {
                try {
                  const d = new Date(timestamp);
                  formattedTimestamp = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
                } catch {}
              }
              // Highlight verdict
              let verdict = finalObj && finalObj.Classification;
              let verdictColor = verdict === 'False' ? 'bg-red-100 text-red-800 border border-red-300' : verdict === 'True' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-blue-100 text-blue-800 border border-blue-300';
              // Render markdown in summary
              let summary = finalObj && finalObj.overall_assessment;
              let summaryJsx = null;
              if (typeof summary === 'string') {
                // Function to render markdown-like formatting
                const renderMarkdown = (text: string) => {
                  // Enhanced regex to better capture markdown elements
                  let parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\n)/g).filter(Boolean);
                  
                  return parts.map((part, i) => {
                    // Bold text **text**
                    if (/^\*\*[^*]+\*\*$/.test(part)) {
                      return <b key={i}>{part.replace(/\*\*/g, '')}</b>;
                    }
                    // Links [text](url) - enhanced pattern matching
                    else if (/^\[[^\]]+\]\([^)]+\)$/.test(part)) {
                      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                      if (match) {
                        const linkText = match[1];
                        const linkUrl = match[2];
                        return (
                          <a 
                            key={i} 
                            href={linkUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            {linkText}
                          </a>
                        );
                      }
                    }
                    // Line breaks
                    else if (part === '\n') {
                      return <br key={i} />;
                    }
                    // Regular text
                    else {
                      return <span key={i}>{part}</span>;
                    }
                  });
                };
                
                summaryJsx = renderMarkdown(summary);
              }
              const isExpanded = expandedResults.has(idx);
              
              return (
                <div key={idx} className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                  {/* Header - Always visible */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleResult(idx)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-gray-700 font-medium mb-1">Claim:</div>
                        <div className="text-base text-gray-900 line-clamp-2">{r.claim}</div>
                        {finalObj && verdict && (
                          <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-semibold ${verdictColor}`}>
                            Verdict: {verdict}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                        <svg 
                          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {/* Fact Check Feedback Component - moved to header */}
                        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                          <FactCheckFeedback
                            factCheckId={taskId || `fact-check-${idx}`}
                            claim={r.claim}
                            verdict={verdict || undefined}
                            userEmail={user?.name || undefined}
                            backendUrl={process.env.NEXT_PUBLIC_BACKEND_URL}
                            accessToken={accessToken || undefined}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-200">
                      {finalObj && (
                        <>
                          {summaryJsx && (
                            <div className="mt-4 mb-4 text-gray-800 text-sm whitespace-pre-line">{summaryJsx}</div>
                          )}
                          {disambiguation && (
                            <div className="mt-4">
                              <button
                                onClick={() => toggleDisambiguation(`disambiguation-${idx}`)}
                                className="flex items-center justify-between w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                              >
                                <span className="text-sm font-semibold text-gray-700">Disambiguation</span>
                                <svg 
                                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedDisambiguations.has(`disambiguation-${idx}`) ? 'rotate-180' : ''}`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {expandedDisambiguations.has(`disambiguation-${idx}`) && (
                                <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="text-sm text-gray-800 whitespace-pre-line">
                                    {disambiguation}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {formattedTimestamp && renderField('Timestamp', formattedTimestamp)}
                      {verifyingSourceObj && (
                        <div className="mt-4">
                          <div className="text-sm font-semibold text-gray-700 mb-3">Verification Sources:</div>
                          <div className="space-y-3">
                            {Array.isArray(verifyingSourceObj) ? (
                              (() => {
                                // Parse and sort sources by relevance (high, medium, low)
                                const parsedSources = verifyingSourceObj.map((source: any, sourceIdx: number) => {
                                  let parsedSource;
                                  try {
                                    parsedSource = typeof source === 'string' ? JSON.parse(source) : source;
                                  } catch (e) {
                                    parsedSource = { source: 'Unknown', summary: source, link: '', title: 'Source', relevance: 'unknown', outcome: 'unknown' };
                                  }
                                  return { ...parsedSource, originalIndex: sourceIdx };
                                });

                                // Sort by relevance: high, medium, low
                                const sortedSources = parsedSources.sort((a, b) => {
                                  const relevanceOrder = { high: 0, medium: 1, low: 2 };
                                  const aOrder = relevanceOrder[a.relevance?.toLowerCase() as keyof typeof relevanceOrder] ?? 3;
                                  const bOrder = relevanceOrder[b.relevance?.toLowerCase() as keyof typeof relevanceOrder] ?? 3;
                                  return aOrder - bOrder;
                                });

                                return sortedSources.map((parsedSource, sourceIdx) => {
                                  const getOutcomeTag = (outcome: string) => {
                                    switch (outcome?.toLowerCase()) {
                                      case 'true': return 'Supporting';
                                      case 'false': return 'Counter Argument';
                                      case 'unverifiable': return 'Neutral';
                                      default: return outcome || 'Unknown';
                                    }
                                  };

                                  return (
                                    <div key={parsedSource.originalIndex} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                      <div className="mb-2">
                                        {/* Top row: Favicon on left, Tag on right */}
                                        <div className="flex items-center justify-between mb-2">
                                          {/* Favicon */}
                                          <div className="flex-shrink-0">
                                            {(() => {
                                              try {
                                                const url = parsedSource.link || parsedSource.url || 'https://example.com';
                                                const domain = new URL(url).hostname;
                                                return (
                                                  <img 
                                                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                                                    alt={`${parsedSource.source || 'Source'} favicon`}
                                                    className="w-4 h-4"
                                                    onError={(e) => {
                                                      // Fallback to a default icon if favicon fails to load
                                                      e.currentTarget.style.display = 'none';
                                                    }}
                                                  />
                                                );
                                              } catch (error) {
                                                // If URL parsing fails, show a default icon
                                                return (
                                                  <div className="w-4 h-4 bg-gray-300 rounded-sm flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                                    </svg>
                                                  </div>
                                                );
                                              }
                                            })()}
                                          </div>
                                          {/* Tag */}
                                          {parsedSource.outcome && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium border border-gray-300 bg-gray-100 text-gray-800">
                                              {getOutcomeTag(parsedSource.outcome)}
                                            </span>
                                          )}
                                        </div>
                                        {/* Title row */}
                                        <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                                          {parsedSource.title || parsedSource.source || 'Source'}
                                        </h4>
                                      </div>
                                      
                                      {parsedSource.summary && (
                                        <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                                          {parsedSource.summary}
                                        </p>
                                      )}
                                      
                                      {parsedSource.link && (
                                        <a 
                                          href={parsedSource.link} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                                        >
                                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                          View Source
                                        </a>
                                      )}
                                    </div>
                                  );
                                });
                              })()
                            ) : (
                              <div className="text-sm text-gray-600">
                                <pre className="whitespace-pre-wrap">{JSON.stringify(verifyingSourceObj, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {/* {renderField('Bias', bias)} */}
                      {renderField('Task ID', taskId)}
                      {/* {renderField('User Info', visualisationMode)} */}
                      {sources && sources.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-semibold text-gray-700 mb-1">Sources & Summaries:</div>
                          <ul className="list-disc list-inside text-xs text-blue-700">
                            {sources.map((src, i) => (
                              <li key={i} className="mb-1">
                                <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900 font-semibold">{src.title}</a>
                                {src.summary && <span className="ml-2 text-gray-700">- {src.summary}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                        )}
                        </>
                      )}
                      {!finalObj && (
                        <div className="text-xs text-gray-600">{JSON.stringify(r.result || r.error || r, null, 2)}</div>
                      )}
                      {error && (
                        <div className="text-xs text-red-600 mt-2">Error parsing result: {String(error)}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Web3 Data Section */}
      {/* {isAuthenticated && (
        <div className="bg-green-50 rounded-xl p-6 mb-8 border-2 border-green-200">
          <h3 className="text-lg font-bold text-green-800 mb-4">Web3 Data Status</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleFetchWeb3Data}
                disabled={web3Loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {web3Loading ? 'Fetching...' : 'Fetch Web3 Data'}
              </button>
              
              {web3Data && (
                <span className="text-green-700 font-medium">✅ Data loaded successfully</span>
              )}
              
              {web3Error && (
                <span className="text-red-700 font-medium">❌ Error: {web3Error}</span>
              )}
            </div>
            
            {web3Data && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Web3 Data Preview:</h4>
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(web3Data, null, 2)}
                </pre>
              </div>
            )}
            
            <p className="text-sm text-green-700">
              Web3 data is automatically fetched when you log in. Check the browser console for detailed logs.
            </p>
          </div>
        </div>
      )} */}

    </div>
  );
};
