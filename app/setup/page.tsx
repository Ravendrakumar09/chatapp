"use client";
import { useState, useEffect } from "react";

export default function SetupPage() {
  const [envStatus, setEnvStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEnvironment();
  }, []);

  const checkEnvironment = async () => {
    try {
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: 'test', room: 'test' }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setEnvStatus({ status: 'success', message: 'Twilio credentials are properly configured!' });
      } else {
        setEnvStatus({ status: 'error', message: data.error, instructions: data.setupInstructions });
      }
    } catch (error: any) {
      setEnvStatus({ status: 'error', message: error.message });
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking Twilio configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Twilio Video Setup</h1>
          
          {envStatus?.status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Configuration Complete!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{envStatus.message}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Configuration Required</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{envStatus?.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Get Twilio Credentials</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <a href="https://console.twilio.com/" target="_blank" className="text-blue-600 hover:underline">Twilio Console</a></li>
                  <li>Sign up or log in to your account</li>
                  <li>Navigate to <strong>Account</strong> → <strong>API Keys & Tokens</strong></li>
                  <li>Click <strong>Create API Key</strong></li>
                  <li>Give it a name (e.g., "Video App")</li>
                  <li>Copy the following values:
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li><strong>Account SID</strong> (starts with <code>AC...</code>)</li>
                      <li><strong>API Key SID</strong> (starts with <code>SK...</code>)</li>
                      <li><strong>API Secret</strong> (long random string)</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Configure Environment Variables</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm mb-3">Create or update your <code>.env.local</code> file in the project root:</p>
                <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`# Twilio Video Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret_here
TWILIO_AUTH_TOKEN=your_auth_token_here`}
                </pre>
                <p className="text-sm mt-3 text-gray-600">
                  Replace the placeholder values with your actual Twilio credentials.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Restart Development Server</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm mb-3">After updating your environment variables:</p>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-sm">
                  <code>npm run dev</code>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 4: Test Your Setup</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="/test-api"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition"
                >
                  Test API Endpoints
                </a>
                <a
                  href="/videocall"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition"
                >
                  Test Video Calling
                </a>
              </div>
            </div>

            {envStatus?.instructions && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Setup Instructions</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>{envStatus.instructions.step1}</li>
                    <li>{envStatus.instructions.step2}</li>
                    <li>{envStatus.instructions.step3}</li>
                    <li>{envStatus.instructions.step4}</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={checkEnvironment}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              Recheck Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
