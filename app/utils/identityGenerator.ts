// Utility function to generate unique identities for Twilio Video calls
// This prevents duplicate identity errors by ensuring each connection gets a unique identifier

let identityCounter = 0;

export function generateUniqueIdentity(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const counter = ++identityCounter;
  
  return `${userId}-${timestamp}-${random}-${counter}`;
}

export function generateUniqueRoomName(userId1: string, userId2: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  
  // Sort user IDs to ensure consistent room names regardless of who initiates
  const sortedIds = [userId1, userId2].sort();
  return `video-call-${sortedIds[0]}-${sortedIds[1]}-${timestamp}-${random}`;
}

// Clean up old identities periodically (optional)
export function cleanupOldIdentities(): void {
  // This could be used to clean up old room names or identities
  // For now, we'll just reset the counter periodically
  if (identityCounter > 10000) {
    identityCounter = 0;
  }
}
