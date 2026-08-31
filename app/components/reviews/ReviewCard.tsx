// app/components/reviews/ReviewCard.tsx

"use client";

import { useState } from "react";
import { MessageSquare, Star, CheckCircle, Loader2, X, AlertCircle } from "lucide-react";

interface ReviewData {
  rating: number;
  title: string;
  comment: string;
  name: string;
  email: string;
  clinicName?: string;
}

type ReviewStatus = 'idle' | 'submitting' | 'success' | 'error';

const ReviewCard = () => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: 0,
    title: '',
    comment: '',
    name: '',
    email: '',
    clinicName: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReviewData(prev => ({ ...prev, [name]: value }));
  };

  const handleStarClick = (rating: number) => {
    setReviewData(prev => ({ ...prev, rating }));
  };

  const handleStarHover = (rating: number) => {
    setHoverRating(rating);
  };

  const validateForm = (): boolean => {
    if (reviewData.rating === 0) {
      setErrorMessage('Please select a rating');
      return false;
    }
    if (!reviewData.title.trim()) {
      setErrorMessage('Please enter a title for your review');
      return false;
    }
    if (!reviewData.comment.trim()) {
      setErrorMessage('Please write your review');
      return false;
    }
    if (!reviewData.name.trim()) {
      setErrorMessage('Please enter your name');
      return false;
    }
    if (!reviewData.email.trim()) {
      setErrorMessage('Please enter your email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewData.email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setReviewStatus('submitting');
    setErrorMessage('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setReviewStatus('success');
      
      setTimeout(() => {
        setReviewData({
          rating: 0,
          title: '',
          comment: '',
          name: '',
          email: '',
          clinicName: ''
        });
        setIsReviewModalOpen(false);
        setReviewStatus('idle');
      }, 2000);
      
    } catch (error) {
      setReviewStatus('error');
      setErrorMessage('Failed to submit review. Please try again.');
    }
  };

  const handleResetForm = () => {
    setReviewData({
      rating: 0,
      title: '',
      comment: '',
      name: '',
      email: '',
      clinicName: ''
    });
    setErrorMessage('');
    setReviewStatus('idle');
  };

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 lg:px-6 pt-8 sm:pt-12">
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Share Your Experience
          </h2>
          <p className="text-gray-600 mt-2 text-lg">
            We'd love to hear your thoughts on our dental practice directory. 
            Your feedback helps improve dental care accessibility across Australia.
          </p>
        </div>

        <div className="mt-10">
          <div className="border-2 border-dashed border-orange-600 bg-white rounded-2xl p-6 md:p-10 max-w-xl hover:border-orange-700 transition-colors duration-200">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-orange-600">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">We Value Your Opinion</h3>
                <p className="text-gray-600 mt-1 leading-relaxed">Share your feedback to help us improve our platform.</p>
              </div>
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="w-max px-6 py-3 rounded-full border border-orange-600 bg-orange-600 text-white hover:bg-orange-700 hover:border-orange-700 transition-all duration-200 font-medium"
              >
                Write a Review
              </button>
            </div>
          </div>
        </div>
      </section>

      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-xs sm:max-w-sm md:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300 mx-2">
            <div className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Write a Review</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Share your experience with us</p>
                </div>
                <button
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    handleResetForm();
                  }}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Overall Rating <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 sm:p-1"
                      >
                        <Star
                          size={28}
                          className={`sm:w-8 sm:h-8 transition-colors duration-200 ${
                            star <= (hoverRating || reviewData.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-300 text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-600">
                      {reviewData.rating > 0 ? `${reviewData.rating}.0` : 'Select'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Review Title <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={reviewData.title}
                    onChange={handleInputChange}
                    placeholder="Brief summary of your experience"
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                    disabled={reviewStatus === 'submitting'}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Your Review <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <textarea
                    name="comment"
                    value={reviewData.comment}
                    onChange={handleInputChange}
                    placeholder="Share details of your experience..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 resize-none"
                    disabled={reviewStatus === 'submitting'}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Your Name <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={reviewData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                      disabled={reviewStatus === 'submitting'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Your Email <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={reviewData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                      disabled={reviewStatus === 'submitting'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Clinic Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="clinicName"
                    value={reviewData.clinicName}
                    onChange={handleInputChange}
                    placeholder="Which clinic are you reviewing?"
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                    disabled={reviewStatus === 'submitting'}
                  />
                </div>

                {errorMessage && (
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-red-600 bg-red-50 p-2.5 sm:p-3 rounded-lg">
                    <AlertCircle size={14} className="sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{errorMessage}</span>
                  </div>
                )}

                {reviewStatus === 'success' && (
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-green-600 bg-green-50 p-2.5 sm:p-3 rounded-lg">
                    <CheckCircle size={14} className="sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">Thank you! Your review has been submitted successfully.</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReviewModalOpen(false);
                      handleResetForm();
                    }}
                    className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                    disabled={reviewStatus === 'submitting'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                    disabled={reviewStatus === 'submitting'}
                  >
                    {reviewStatus === 'submitting' ? (
                      <>
                        <Loader2 size={16} className="sm:w-5 sm:h-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : reviewStatus === 'success' ? (
                      <>
                        <CheckCircle size={16} className="sm:w-5 sm:h-5" />
                        <span>Submitted!</span>
                      </>
                    ) : (
                      <span>Submit Review</span>
                    )}
                  </button>
                </div>
              </form>

              <p className="text-[10px] xs:text-xs text-gray-500 mt-3 sm:mt-4 text-center px-2">
                Your review will be publicly visible. We respect your privacy and never share your email.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewCard;