"use client";
import { useState } from "react";
import { useVideoCallNotifications } from "@/app/hooks/useVideoCallNotifications";
import { generateUniqueIdentity } from "@/app/utils/identityGenerator";

export default function TestVideoCallsPage() {
  const [testUserId, setTestUserId] = useState(`test-user-${Date.now()}`);
  const [targetUserId, setTargetUserId] = useState(`test-user-${Date.now() + 1}`);
  const [roomName, setRoomName] = useState(`test-room-${Date.now()}`);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const {
    incomingCall,
    sendVideoCall,
    acceptCall,
    rejectCall,
    endCall,
    clearIncomingCall,
  } = useVideoCallNotifications(testUserId);

  const testSendVideoCall = async () => {
    setLoading(true);
    setResult("Testing sendVideoCall...");
    
    try {
      const notificationId = await sendVideoCall(targetUserId, roomName);
      setResult(`✅ Video call sent successfully! Notification ID: ${notificationId}`);
    } catch (error: any) {
      setResult(`❌ Error sending video call: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testAcceptCall = async () => {
    if (!incomingCall) {
      setResult("❌ No incoming call to accept");
      return;
    }

    setLoading(true);
    setResult("Testing acceptCall...");
    
    try {
      await acceptCall(incomingCall.id);
      setResult(`✅ Call accepted successfully!`);
    } catch (error: any) {
      setResult(`❌ Error accepting call: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testRejectCall = async () => {
    if (!incomingCall) {
      setResult("❌ No incoming call to reject");
      return;
    }

    setLoading(true);
    setResult("Testing rejectCall...");
    
    try {
      await rejectCall(incomingCall.id);
      setResult(`✅ Call rejected successfully!`);
    } catch (error: any) {
      setResult(`❌ Error rejecting call: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testEndCall = async () => {
    if (!incomingCall) {
      setResult("❌ No call to end");
      return;
    }

    setLoading(true);
    setResult("Testing endCall...");
    
    try {
      await endCall(incomingCall.id);
      setResult(`✅ Call ended successfully!`);
    } catch (error: any) {
      setResult(`❌ Error ending call: ${error.message}`);
    }
    
    setLoading(false);
  };

  const generateNewTestIds = () => {
    const newTestUserId = generateUniqueIdentity('test-user');
    const newTargetUserId = generateUniqueIdentity('test-user');
    const newRoomName = `test-room-${Date.now()}`;
    
    setTestUserId(newTestUserId);
    setTargetUserId(newTargetUserId);
    setRoomName(newRoomName);
    setResult(`✅ Generated new test IDs: ${newTestUserId}, ${newTargetUserId}, ${newRoomName}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Video Call Functions Test</h1>
        
        {/* Test Configuration */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test User ID:</label>
              <input
                type="text"
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target User ID:</label>
              <input
                type="text"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Room Name:</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Functions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={testSendVideoCall}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
            >
              Test Send Video Call
            </button>
            <button
              onClick={testAcceptCall}
              disabled={loading || !incomingCall}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
            >
              Test Accept Call
            </button>
            <button
              onClick={testRejectCall}
              disabled={loading || !incomingCall}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
            >
              Test Reject Call
            </button>
            <button
              onClick={testEndCall}
              disabled={loading || !incomingCall}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
            >
              Test End Call
            </button>
            <button
              onClick={generateNewTestIds}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              New Test IDs
            </button>
          </div>
        </div>

        {/* Incoming Call Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Incoming Call Status</h2>
          {incomingCall ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p><strong>Call ID:</strong> {incomingCall.id}</p>
              <p><strong>From:</strong> {incomingCall.from_user_name || 'Unknown'}</p>
              <p><strong>Room:</strong> {incomingCall.room_name}</p>
              <p><strong>Status:</strong> {incomingCall.status}</p>
              <p><strong>Type:</strong> {incomingCall.call_type}</p>
            </div>
          ) : (
            <p className="text-gray-500">No incoming call</p>
          )}
        </div>

        {/* Test Results */}
        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {result}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Test Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure Supabase is configured (visit /test-supabase first)</li>
            <li>Use different User IDs for testing (e.g., "user1", "user2")</li>
            <li>Test "Send Video Call" to create a notification</li>
            <li>Switch to the target user ID and test "Accept Call"</li>
            <li>Test "End Call" to verify the fix</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
