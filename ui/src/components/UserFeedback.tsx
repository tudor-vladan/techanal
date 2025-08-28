import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Send } from 'lucide-react';

interface FeedbackData {
  analysisId: string;
  userId: string;
  feedbackType: 'accuracy' | 'usefulness' | 'speed' | 'general';
  rating: number;
  comment?: string;
  metadata?: {
    chartType?: string;
    pattern?: string;
    timeframe?: string;
    assetType?: string;
  };
}

interface UserFeedbackProps {
  analysisId: string;
  userId: string;
  metadata?: {
    chartType?: string;
    pattern?: string;
    timeframe?: string;
    assetType?: string;
  };
  onSubmit?: (feedback: FeedbackData) => void;
  className?: string;
}

export const UserFeedback: React.FC<UserFeedbackProps> = ({
  analysisId,
  userId,
  metadata,
  onSubmit,
  className = ''
}) => {
  const [feedbackType, setFeedbackType] = useState<'accuracy' | 'usefulness' | 'speed' | 'general'>('accuracy');
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const feedbackTypes = [
    { value: 'accuracy', label: 'Accuracy', icon: ThumbsUp, description: 'How accurate was the analysis?' },
    { value: 'usefulness', label: 'Usefulness', icon: MessageSquare, description: 'How useful was the analysis?' },
    { value: 'speed', label: 'Speed', icon: Star, description: 'How fast was the analysis?' },
    { value: 'general', label: 'General', icon: MessageSquare, description: 'General feedback' }
  ];

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData: FeedbackData = {
        analysisId,
        userId,
        feedbackType,
        rating,
        comment: comment.trim() || undefined,
        metadata
      };

      // Submit feedback to API
      const response = await fetch('/api/learning/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        onSubmit?.(feedbackData);
        
        // Reset form
        setRating(0);
        setComment('');
        setFeedbackType('accuracy');
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackTypeChange = (type: 'accuracy' | 'usefulness' | 'speed' | 'general') => {
    setFeedbackType(type);
    setRating(0); // Reset rating when changing feedback type
  };

  if (isSubmitted) {
    return (
      <Card className={`${className}`}>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <ThumbsUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you for your feedback!</h3>
            <p className="text-gray-600 mb-4">
              Your feedback helps us improve our AI analysis accuracy and user experience.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsSubmitted(false)}
              className="w-full"
            >
              Submit Another Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Help Us Improve
        </CardTitle>
        <CardDescription>
          Share your feedback to help us improve our AI analysis accuracy and performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feedback Type Selection */}
        <div className="space-y-3">
          <Label>What would you like to provide feedback on?</Label>
          <div className="grid grid-cols-2 gap-3">
            {feedbackTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.value}
                  variant={feedbackType === type.value ? 'default' : 'outline'}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                  onClick={() => handleFeedbackTypeChange(type.value as any)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{type.label}</span>
                </Button>
              );
            })}
          </div>
          {feedbackType && (
            <p className="text-sm text-gray-600 mt-2">
              {feedbackTypes.find(t => t.value === feedbackType)?.description}
            </p>
          )}
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <Label>How would you rate this {feedbackType}?</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant={rating >= star ? 'default' : 'outline'}
                size="sm"
                className="w-12 h-12 p-0"
                onClick={() => handleRatingClick(star)}
              >
                <Star className={`w-5 h-5 ${rating >= star ? 'fill-current' : ''}`} />
              </Button>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-3">
          <Label htmlFor="comment">Additional comments (optional)</Label>
          <Textarea
            id="comment"
            placeholder="Tell us more about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>

        {/* Metadata Display */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="space-y-3">
            <Label>Analysis Context</Label>
            <div className="flex flex-wrap gap-2">
              {metadata.chartType && (
                <Badge variant="secondary">
                  Chart: {metadata.chartType}
                </Badge>
              )}
              {metadata.pattern && (
                <Badge variant="secondary">
                  Pattern: {metadata.pattern}
                </Badge>
              )}
              {metadata.timeframe && (
                <Badge variant="secondary">
                  Timeframe: {metadata.timeframe}
                </Badge>
              )}
              {metadata.assetType && (
                <Badge variant="secondary">
                  Asset: {metadata.assetType}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>

        {/* Privacy Note */}
        <p className="text-xs text-gray-500 text-center">
          Your feedback is anonymous and helps improve our AI models. We never share personal information.
        </p>
      </CardContent>
    </Card>
  );
};
