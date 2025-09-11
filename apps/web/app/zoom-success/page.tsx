// apps/web/app/zoom-success/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@repo/ui/components/ui/button";
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function ZoomSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const error = searchParams.get('error');
    const zoomConnected = searchParams.get('zoom_connected');
    const spaceId = searchParams.get('spaceId');

    if (error) {
      setStatus('error');
      setMessage(getErrorMessage(error));
    } else if (zoomConnected === 'true') {
      setStatus('success');
      setMessage('Your Zoom account has been successfully connected!');
      // Auto-close tab if opened as popup
      setTimeout(() => {
        if (window.opener) {
          window.close();
        } else {
          const redirectPath = spaceId ? `/spaces/${spaceId}` : '/spaces';
          router.push(redirectPath);
        }
      }, 3000);
    } else {
      setStatus('error');
      setMessage('Something went wrong during the connection process.');
    }
  }, [searchParams, router]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'zoom_oauth_access_denied':
        return 'You denied access to your Zoom account. Please try again if you want to create meetings.';
      case 'invalid_oauth_state':
        return 'Invalid authentication state. Please try connecting your Zoom account again.';
      case 'missing_oauth_params':
        return 'Missing required parameters. Please try connecting your Zoom account again.';
      default:
        return 'An error occurred while connecting your Zoom account. Please try again.';
    }
  };

  const handleReturnToSpaces = () => {
    const spaceId = searchParams.get('spaceId');
    const redirectPath = spaceId ? `/spaces/${spaceId}` : '/spaces';
    router.push(redirectPath);
  };

  const handleRetryConnection = () => {
    const spaceId = searchParams.get('spaceId');
    const authUrl = spaceId 
      ? `/api/zoom/oauth/authorize?spaceId=${spaceId}`
      : '/api/zoom/oauth/authorize';
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Connection...
            </h1>
            <p className="text-gray-600">
              Please wait while we complete your Zoom account connection.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Zoom Connected Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              You can now create Zoom meetings from your personal account.
              Redirecting you back to your space...
            </p>
            <Button onClick={handleReturnToSpaces} className="w-full">
              Return to Spaces
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Connection Failed
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Button onClick={handleRetryConnection} className="w-full">
                Try Again
              </Button>
              <Button 
                onClick={handleReturnToSpaces} 
                variant="outline" 
                className="w-full"
              >
                Return to Spaces
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}