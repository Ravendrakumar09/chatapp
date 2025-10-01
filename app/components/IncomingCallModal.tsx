'use client';
import React from 'react';
import { IoCall, IoClose, IoVideocam } from 'react-icons/io5';

interface IncomingCallModalProps {
  isOpen: boolean;
  callerName: string;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallModal({
  isOpen,
  callerName,
  onAccept,
  onReject,
}: IncomingCallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
        <div className="text-center">
          {/* Caller Avatar */}
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoVideocam size={32} className="text-white" />
          </div>

          {/* Caller Info */}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Incoming Video Call
          </h2>
          <p className="text-gray-600 mb-6">
            {callerName} is calling you
          </p>

          {/* Call Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <IoCall size={24} className="text-white" />
              </div>
              <div className="absolute inset-0 w-16 h-16 bg-green-500 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onReject}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <IoClose size={20} />
              <span>Decline</span>
            </button>
            <button
              onClick={onAccept}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <IoVideocam size={20} />
              <span>Accept</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
