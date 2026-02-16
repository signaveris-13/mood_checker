"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

const errorMessages: Record<string, string> = {
  Configuration:
    "There is a problem with the server configuration. Check that GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and NEXTAUTH_SECRET are set correctly in your .env file.",
  AccessDenied: "Access was denied. You may not have permission to sign in.",
  Verification:
    "The verification link may have expired or already been used.",
  OAuthSignin: "Could not start the Google sign-in flow. Check your Google OAuth credentials.",
  OAuthCallback:
    "Could not complete the Google sign-in. Verify that the OAuth redirect URI is configured correctly in Google Cloud Console.",
  OAuthCreateAccount: "Could not create a user account via Google sign-in.",
  Callback: "There was an error during the authentication callback.",
  Default: "An unexpected authentication error occurred.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error") || "Default";
  const message = errorMessages[errorType] || errorMessages.Default;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-2">
          Authentication Error
        </h1>
        <p className="text-sm text-gray-500 mb-4">Error type: {errorType}</p>
        <p className="text-gray-700 mb-6">{message}</p>
        <Link
          href="/"
          className="inline-block bg-gray-800 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-gray-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
