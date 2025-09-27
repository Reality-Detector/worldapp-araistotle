"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../../hooks/useAuth";
import { getUserWeb3Data } from "../../utils/apiClient";
import { useCredits } from "../../components/CreditProvider";
import { useFactCheck } from '@/components/FactCheckProvider/factcheck-context';

export const HomeContent = () => {
  const [showMore, setShowMore] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [web3Data, setWeb3Data] = useState<any>(null);
  const [web3Loading, setWeb3Loading] = useState(false);
  const [web3Error, setWeb3Error] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading, accessToken, session } = useAuth();
  const { creditData, isLoading: creditsLoading, error: creditsError, refetchCredits } = useCredits();
  const { results } = useFactCheck();

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
          <h3 className="text-lg font-bold text-gray-800 mb-4">Fact-check Results</h3>
          <div className="space-y-4">
            {results.map((r: any, idx: number) => {
              // Try to extract the 'final' field from the result (as JSON string)
              let finalObj: any = null;
              let error = null;
              if (r.result && typeof r.result === 'string') {
                try {
                  const lines = r.result.split(/\n+/).filter(Boolean);
                  const finalLine = lines.reverse().find((line: string) => {
                    try {
                      const obj = JSON.parse(line);
                      return obj.final;
                    } catch { return false; }
                  });
                  if (finalLine) {
                    const obj = JSON.parse(finalLine);
                    finalObj = JSON.parse(obj.final);
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
              // let taskId = finalObj && finalObj.task_id; // commented out
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
              // Bold **text** in summary
              let summary = finalObj && finalObj.overall_assessment;
              let summaryJsx = null;
              if (typeof summary === 'string') {
                // Replace **text** with <b>text</b>
                const parts = summary.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
                summaryJsx = parts.map((part, i) => {
                  if (/^\*\*[^*]+\*\*$/.test(part)) {
                    return <b key={i}>{part.replace(/\*\*/g, '')}</b>;
                  }
                  return <span key={i}>{part}</span>;
                });
              }
              return (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="text-sm text-gray-700 font-medium">Claim:</div>
                  <div className="text-base text-gray-900 mb-2">{r.claim}</div>
                  {finalObj && (
                    <>
                      {verdict && (
                        <div className={`mb-2 inline-block px-2 py-1 rounded text-xs font-semibold mr-2 ${verdictColor}`}>Verdict: {verdict}</div>
                      )}
                      {summaryJsx && (
                        <div className="mb-2 text-gray-800 text-sm whitespace-pre-line">{summaryJsx}</div>
                      )}
                      {renderField('Disambiguation', disambiguation)}
                      {formattedTimestamp && renderField('Timestamp', formattedTimestamp)}
                      {/* {renderField('Bias', bias)} */}
                      {/* {renderField('Task ID', taskId)} */}
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
