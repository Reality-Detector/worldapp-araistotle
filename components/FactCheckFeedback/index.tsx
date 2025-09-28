"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCredits } from '../../components/CreditProvider';
import { useRewardPoints } from '../../utils/apiClient';

const FACT_CHECK_FEEDBACK_COLOR = '#0066FF'; // Define the custom blue color

interface FactCheckFeedbackProps {
  factCheckId: string;
  claim: string;
  verdict?: string;
  userEmail?: string;
  backendUrl?: string;
  accessToken?: string;
}

/**
 * FactCheckFeedback component that provides like/dislike feedback for fact checks
 * 
 * @param {string} factCheckId - The ID of the fact check
 * @param {string} claim - The claim being fact-checked
 * @param {string} verdict - The verdict of the fact check
 * @param {string} userEmail - The email of the current user
 * @param {string} backendUrl - The backend URL for API calls
 * @param {string} accessToken - The access token for authentication
 * @returns {JSX.Element}
 */
const FactCheckFeedback = ({ 
  factCheckId, 
  claim, 
  verdict,
  userEmail, 
  backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://r8wncu74i2.us-west-2.awsapprunner.com',
  accessToken 
}: FactCheckFeedbackProps) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackReason, setFeedbackReason] = useState<string[]>([]);
  const [feedbackType, setFeedbackType] = useState('');
  const [showCreditAnimation, setShowCreditAnimation] = useState(false);
  const [showAlreadyAwardedAnimation, setShowAlreadyAwardedAnimation] = useState(false);
  const [creditAmount, setCreditAmount] = useState(3);
  const [rewardMessage, setRewardMessage] = useState('');
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  
  const { user, isAuthenticated, session } = useAuth();
  const { creditData, refetchCredits } = useCredits();
  const { rewardBonusPoint } = useRewardPoints();
  
  // Check if user is logged in
  const isLoggedIn = Boolean(userEmail || user?.email || user?.name);
  
  // Debug logging
  console.log('FactCheckFeedback Debug:', {
    factCheckId,
    userEmail,
    userEmailFromUser: user?.email,
    userNameFromUser: user?.name,
    fullUserObject: user,
    isLoggedIn,
    isAuthenticated,
    session: session
  });
  
  // Centralized function to handle POST requests
  const postFactCheckAction = async (actionType: string, data: any = {}) => {
    setLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Validator': 'worldapp',
        'Frontend': 'worldapp',
        'Authorization': `Bearer ${accessToken}`
      };
      
      
      const requestBody = {
        ...data,
        userEmail: userEmail || user?.email || user?.name
      };
      
      console.log('Making API request:', {
        url: `${backendUrl}/api/tasks/${factCheckId}/${actionType}`,
        method: 'POST',
        body: requestBody
      });

      const response = await fetch(`${backendUrl}/api/tasks/${factCheckId}/${actionType}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      console.log('API response status:', response.status);
      console.log('API response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || 'Something went wrong');
      }

      const result = await response.json();
      console.log('API success response:', result);
      return result;
    } catch (error) {
      console.error(`Failed to ${actionType}:`, error);
      setSnackbar({ open: true, message: error instanceof Error ? error.message : 'Something went wrong', severity: 'error' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    console.log('handleLike called', { liked, isLoggedIn });
    if (liked) return; // Prevent multiple likes

    setLiked(true);
    setDisliked(false);
    setFeedbackType('like');
    setFeedbackDialogOpen(true);
    
    console.log('Calling postFactCheckAction with like');
    await postFactCheckAction('like');
  };

  const handleDislike = async () => {
    if (disliked) return; // Prevent multiple dislikes

    setDisliked(true);
    setLiked(false);
    setFeedbackType('dislike');
    setFeedbackDialogOpen(true);
    
    await postFactCheckAction('dislike');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseFeedbackDialog = () => {
    setFeedbackDialogOpen(false);
    setFeedbackText('');
    setFeedbackReason([]);
  };

  const handleSubmitFeedback = async () => {
    const feedbackData = {
      reasons: feedbackReason,
      comments: feedbackText,
    };

    const result = await postFactCheckAction('feedback', feedbackData);
    if (result) {
      setFeedbackDialogOpen(false);
      
      // Calculate credits: 3 for basic feedback, 6 for written feedback
      const hasTextFeedback = feedbackText && feedbackText.trim().length > 0;
      const creditsAwarded = hasTextFeedback ? 6 : 3;
      
      // Call reward points API after successful feedback
      if (user?.name) {
        try {
          const rewardResult = await rewardBonusPoint(
            'feedback',
            creditsAwarded,
            factCheckId, // Use factCheckId as task_id
            user.name, // This is the worldId from auth
            backendUrl
          );
          
          if (rewardResult.success && rewardResult.data) {
            console.log(`Successfully rewarded ${creditsAwarded} points for feedback`, rewardResult.data);
            
            // Show credit animation only after successful backend response
            console.log('Reward result:', rewardResult);
            setCreditAmount(creditsAwarded);
            setRewardMessage(rewardResult.data.message || 'Thank you for your feedback!');
            setShowCreditAnimation(true);
            
            // Refetch credits to update the credit state
            await refetchCredits();
            
            console.log('Updated credits:', {
              updatedCredits: rewardResult.data.updatedCredits,
              dailyCredits: rewardResult.data.dailyCredits,
              lifetimeCredits: rewardResult.data.lifetimeCredits,
              communityCredits: rewardResult.data.communityCredits
            });
            
            // Hide the animation after 2.5 seconds
            setTimeout(() => {
              setShowCreditAnimation(false);
              setFeedbackText('');
              setFeedbackReason([]);
            }, 2500);
          } else {
            console.error("Failed to reward points:", rewardResult.error || "Unknown error");
            // Still show success message even if reward points failed
            setSnackbar({ open: true, message: 'Feedback submitted successfully', severity: 'success' });
            setFeedbackText('');
            setFeedbackReason([]);
          }
        } catch (error) {
          console.error("Error rewarding points:", error);
          // Still show success message even if reward points failed
          setSnackbar({ open: true, message: 'Feedback submitted successfully', severity: 'success' });
          setFeedbackText('');
          setFeedbackReason([]);
        }
      } else {
        console.log("Cannot reward points: missing user.name (worldId)");
        // Show success message even if we can't reward points
        setSnackbar({ open: true, message: 'Feedback submitted successfully', severity: 'success' });
        setFeedbackText('');
        setFeedbackReason([]);
      }
    }
  };

  const handleReasonToggle = (reason: string) => {
    setFeedbackReason((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  // Get feedback options based on feedback type
  const getFeedbackOptions = () => {
    if (feedbackType === 'like') {
      return ['Good sources', 'Balanced assessment', 'Clear explanation', 'Learned something new'];
    } else {
      return ['Not factually correct', 'Out of date', 'Harmful or offensive', 'Wrong Context'];
    }
  };

  // Auto-hide the snackbar after 3 seconds
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        handleCloseSnackbar();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  console.log('FactCheckFeedback rendering with:', { isLoggedIn, liked, disliked });
  
  return (
    <div className="relative transition-all duration-300">
      {/* Credit Animation */}
      {showCreditAnimation && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-blue-50/90 backdrop-blur-sm rounded-lg animate-pulse">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-blue-600">
              <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-lg font-bold text-blue-800 mb-2">
              {rewardMessage || 'Thank You!'}
            </div>
            <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-xl">
              <span>🏆</span>
              <span>+{creditAmount} Credits</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Already Awarded Animation */}
      {showAlreadyAwardedAnimation && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-yellow-50/90 backdrop-blur-sm rounded-lg animate-pulse">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-yellow-600">
              <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-lg font-bold text-yellow-800 mb-2">
              {rewardMessage || 'Thank You!'}
            </div>
            <div className="text-sm text-yellow-700">
              {rewardMessage || 'Points already awarded for this action.'}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-1 w-full">
        {/* Action buttons group */}
        <div className="flex gap-2 justify-end flex-shrink-0">
          {/* Like Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Like button clicked');
                handleLike();
              }}
              disabled={loading || !isLoggedIn}
              className={`p-2 rounded-lg transition-all duration-200 ${
                liked 
                  ? 'text-blue-600 bg-blue-100' 
                  : isLoggedIn 
                    ? 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 cursor-pointer' 
                    : 'text-gray-400 cursor-not-allowed'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.894a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
            </button>
            <div className="text-xs font-bold text-center mt-1 text-blue-600 whitespace-nowrap">
              Like
            </div>
          </div>

          {/* Dislike Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Dislike button clicked');
                handleDislike();
              }}
              disabled={loading || !isLoggedIn}
              className={`p-2 rounded-lg transition-all duration-200 ${
                disliked 
                  ? 'text-red-600 bg-red-100' 
                  : isLoggedIn 
                    ? 'text-gray-600 hover:bg-red-50 hover:text-red-600 cursor-pointer' 
                    : 'text-gray-400 cursor-not-allowed'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.894a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
              </svg>
            </button>
            <div className="text-xs font-bold text-center mt-1 text-red-600 whitespace-nowrap">
              Dislike
            </div>
          </div>
        </div>

        {/* Credits badge */}
        {!isLoggedIn && (
          <div className="text-xs font-bold text-blue-600 border border-dashed border-blue-600 rounded-full px-2 py-1 bg-blue-50 self-end mt-1">
            Login to rate
          </div>
        )}
      </div>

      {/* Feedback Dialog */}
      {feedbackDialogOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseFeedbackDialog();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-blue-600">
                {feedbackType === 'like' ? 'What did you like?' : 'How Can We Improve?'}
              </h3>
              <button
                onClick={handleCloseFeedbackDialog}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Dialog Content */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Please share your feedback to help us improve:
                </p>
                <div className="text-xs font-bold text-blue-600 border border-blue-600 rounded-full px-3 py-1 bg-blue-50">
                  +6 Credits for feedback
                </div>
              </div>
              
              {/* Reason buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {getFeedbackOptions().map((reason) => (
                  <button
                    key={reason}
                    onClick={() => handleReasonToggle(reason)}
                    className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                      feedbackReason.includes(reason)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              
              {/* Text input */}
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={feedbackType === 'like' ? "Tell us what you liked (written feedback gets 3 additional points)" : "Your feedback (written feedback gets 3 additional points)"}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
            
            {/* Dialog Actions */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
              <button
                onClick={handleCloseFeedbackDialog}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  `Submit & Get ${feedbackText.trim().length > 0 ? '6' : '3'} Credits`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg ${
            snackbar.severity === 'error' 
              ? 'bg-red-100 text-red-800 border border-red-300' 
              : 'bg-green-100 text-green-800 border border-green-300'
          }`}>
            {snackbar.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default FactCheckFeedback;