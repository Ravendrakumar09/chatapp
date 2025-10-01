"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<string>("Testing...");
  const [error, setError] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    testSupabaseConnection();
    checkEnvironmentVariables();
  }, []);

  const checkEnvironmentVariables = () => {
    const vars = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Missing',
      twilioApiKey: process.env.TWILIO_API_KEY_SID ? 'Set' : 'Missing',
      twilioApiSecret: process.env.TWILIO_API_SECRET ? 'Set' : 'Missing',
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Missing',
    };
    setEnvVars(vars);
  };

  const testSupabaseConnection = async () => {
    try {
      setConnectionStatus("Testing Supabase connection...");
      setError(null);

      const supabase = createClient();
      
      // Test basic connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        throw new Error(`Supabase Error: ${error.message}`);
      }

      setConnectionStatus("✅ Supabase connection successful!");
      
    } catch (err: any) {
      console.error('Supabase connection error:', err);
      setError(err.message);
      setConnectionStatus("❌ Supabase connection failed");
    }
  };

  const testAuth = async () => {
    try {
      setConnectionStatus("Testing authentication...");
      const supabase = createClient();
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw new Error(`Auth Error: ${error.message}`);
      }

      if (user) {
        setConnectionStatus(`✅ User authenticated: ${user.email}`);
      } else {
        setConnectionStatus("ℹ️ No user currently authenticated");
      }
      
    } catch (err: any) {
      console.error('Auth test error:', err);
      setError(err.message);
      setConnectionStatus("❌ Authentication test failed");
    }
  };

  const testRealtime = async () => {
    try {
      setConnectionStatus("Testing real-time connection...");
      const supabase = createClient();
      
      const channel = supabase
        .channel('test-channel')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles'
        }, (payload) => {
          console.log('Realtime test received:', payload);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnectionStatus("✅ Real-time connection successful!");
            // Unsubscribe after test
            setTimeout(() => {
              supabase.removeChannel(channel);
            }, 2000);
          } else if (status === 'CHANNEL_ERROR') {
            throw new Error('Real-time channel error');
          }
        });
      
    } catch (err: any) {
      console.error('Realtime test error:', err);
      setError(err.message);
      setConnectionStatus("❌ Real-time connection failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>
        
        {/* Environment Variables Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className={`p-2 rounded ${envVars.supabaseUrl === 'Set' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {envVars.supabaseUrl}
              </div>
              <div className={`p-2 rounded ${envVars.supabaseKey === 'Set' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {envVars.supabaseKey}
              </div>
            </div>
            <div className="space-y-2">
              <div className={`p-2 rounded ${envVars.twilioAccountSid === 'Set' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <strong>TWILIO_ACCOUNT_SID:</strong> {envVars.twilioAccountSid}
              </div>
              <div className={`p-2 rounded ${envVars.twilioApiKey === 'Set' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <strong>TWILIO_API_KEY_SID:</strong> {envVars.twilioApiKey}
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="mb-4">
            <p className="text-lg">{connectionStatus}</p>
            {error && (
              <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={testSupabaseConnection}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Test Database Connection
            </button>
            <button
              onClick={testAuth}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Test Authentication
            </button>
            <button
              onClick={testRealtime}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              Test Real-time
            </button>
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="bg-yellow-50 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Troubleshooting Guide</h3>
          <div className="space-y-2 text-sm">
            <p><strong>If you see "Failed to fetch" error:</strong></p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Check if your Supabase URL and key are correct in .env.local</li>
              <li>Make sure your Supabase project is active and not paused</li>
              <li>Verify your internet connection</li>
              <li>Check if there are any CORS issues in browser console</li>
            </ol>
            
            <p className="mt-4"><strong>If environment variables are missing:</strong></p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Run: <code className="bg-gray-200 px-1 rounded">node setup-environment.js</code></li>
              <li>Add your Supabase credentials to .env.local</li>
              <li>Restart your development server</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
