"use client";
import { useState } from "react";

export default function TestAPIPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testTokenAPI = async () => {
    setLoading(true);
    setResult("Testing token API...");
    
    try {
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: 'test-user', room: 'test-room' }),
      });

      const responseText = await response.text();
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        // Decode the JWT token to show its contents
        try {
          const tokenParts = data.token.split('.');
          const payload = JSON.parse(atob(tokenParts[1]));
          setResult(`✅ Token API Success:\n\nToken: ${data.token}\n\nDecoded Payload:\n${JSON.stringify(payload, null, 2)}`);
        } catch (e) {
          setResult(`✅ Token API Success: ${JSON.stringify(data, null, 2)}`);
        }
      } else {
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.setupInstructions) {
            setResult(`❌ Token API Error (${response.status}): ${errorData.error}\n\nSetup Instructions:\n1. ${errorData.setupInstructions.step1}\n2. ${errorData.setupInstructions.step2}\n3. ${errorData.setupInstructions.step3}\n4. ${errorData.setupInstructions.step4}`);
          } else {
            setResult(`❌ Token API Error (${response.status}): ${responseText}`);
          }
        } catch (e) {
          setResult(`❌ Token API Error (${response.status}): ${responseText}`);
        }
      }
    } catch (error: any) {
      setResult(`❌ Token API Exception: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testCreateRoomAPI = async () => {
    setLoading(true);
    setResult("Testing create-room API...");
    
    try {
      const response = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: 'test-room-' + Date.now() }),
      });

      const responseText = await response.text();
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        setResult(`✅ Create Room API Success: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Create Room API Error (${response.status}): ${responseText}`);
      }
    } catch (error: any) {
      setResult(`❌ Create Room API Exception: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testTokenAPI}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded mr-4"
          >
            Test Token API
          </button>
          
          <button
            onClick={testCreateRoomAPI}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded"
          >
            Test Create Room API
          </button>
        </div>

        {loading && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Testing API...
          </div>
        )}

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Setup Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Create a <code>.env.local</code> file in your project root</li>
            <li>Add your Twilio credentials:
              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs">
{`TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_API_KEY_SID=your_api_key_sid
TWILIO_API_SECRET=your_api_secret`}
              </pre>
            </li>
            <li>Get credentials from <a href="https://console.twilio.com/" target="_blank" className="text-blue-600 underline">Twilio Console</a></li>
            <li>Restart your development server after adding environment variables</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
