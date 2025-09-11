"use client";

import { useState } from 'react';
import { Button } from "@repo/ui/components/ui/button";

export function ResumeSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleResume = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/stripe/resume-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resume subscription');
      }

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Error resuming subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleResume}
      disabled={loading}
      className="bg-yellow-500 hover:bg-yellow-600 text-white"
    >
      {loading ? 'Processing...' : 'Resume Subscription'}
    </Button>
  );
} 