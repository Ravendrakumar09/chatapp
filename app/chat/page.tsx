'use client';
import { use, useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { 
  RiMore2Fill, 
  RiSearchLine, 
  RiVideoLine, 
  RiPhoneLine,
  RiAttachment2,
  RiEmojiStickerLine,
  RiSendPlaneFill,
  RiAddLine,
  RiMenuLine,
  RiArrowLeftLine
} from "react-icons/ri";
import toast from "react-hot-toast";


export default function page() {
  const [user, setUser] = useState<null | User>(null);
  const router = useRouter();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userToChat, setUserToChat] = useState<any>(null);
  const [showUserDetailButton, setShowUserDetailButton] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chats");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mobileMessagesEndRef = useRef<HTMLDivElement | null>(null);
  const desktopMessagesEndRef = useRef<HTMLDivElement | null>(null);

  // Utility function to scroll to bottom
  const scrollToBottom = () => {
    console.log("🔄 ScrollToBottom called");
    
    // Find the active message container and scroll it
    const mobileContainer = document.querySelector('.mobile-messages-container');
    const desktopContainer = document.querySelector('.desktop-messages-container');
    
    if (mobileContainer && window.innerWidth < 1024) {
      console.log("📱 Scrolling mobile container");
      mobileContainer.scrollTop = mobileContainer.scrollHeight;
    } else if (desktopContainer && window.innerWidth >= 1024) {
      console.log("💻 Scrolling desktop container");
      desktopContainer.scrollTop = desktopContainer.scrollHeight;
    }
    
    // Also try the ref approach as backup
    if (mobileMessagesEndRef.current) {
      console.log("📱 Scrolling mobile messages via ref");
      mobileMessagesEndRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "end",
        inline: "nearest"
      });
    }
    
    if (desktopMessagesEndRef.current) {
      console.log("💻 Scrolling desktop messages via ref");
      desktopMessagesEndRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "end",
        inline: "nearest"
      });
    }
  };

  // Enhanced scroll function with better reliability
  const forceScrollToBottom = () => {
    // Try multiple times to ensure scroll works
    setTimeout(() => {
      scrollToBottom();
    }, 50);
    
    setTimeout(() => {
      scrollToBottom();
    }, 200);
    
    setTimeout(() => {
      scrollToBottom();
    }, 500);
    
    // Additional attempt with direct scroll
    setTimeout(() => {
      const mobileContainer = document.querySelector('.mobile-messages-container');
      const desktopContainer = document.querySelector('.desktop-messages-container');
      
      if (mobileContainer) {
        mobileContainer.scrollTo({
          top: mobileContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
      
      if (desktopContainer) {
        desktopContainer.scrollTo({
          top: desktopContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 1000);
  };

  // Function to calculate only unread message counts
  const calculateUnreadCounts = async () => {
    if (!user?.id) return;

    const supabase = createClient();
    const counts: {[key: string]: number} = {};

    // Get all messages where current user is the receiver
    const { data: allMessages, error } = await supabase
      .from("privatemessages")
      .select("*")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching messages for unread count:", error);
      return;
    }

    // Only count messages that haven't been read
    allMessages?.forEach((message) => {
      const senderId = message.sender_id;
      const messageId = message.id;
      
      // Only count if message is not in read messages set
      if (!readMessages.has(messageId)) {
        if (!counts[senderId]) {
          counts[senderId] = 0;
        }
        counts[senderId]++;
      }
    });

    setUnreadCounts(counts);
  };

  // Function to mark messages as read when user opens chat
  const markMessagesAsRead = async (senderId: string) => {
    if (!user?.id) return;

    const supabase = createClient();
    
    // Get all messages from this sender
    const { data: messages, error } = await supabase
      .from("privatemessages")
      .select("id")
      .eq("receiver_id", user.id)
      .eq("sender_id", senderId);

    if (error) {
      console.error("Error fetching messages to mark as read:", error);
      return;
    }

    // Mark all messages from this sender as read
    if (messages) {
      const messageIds = messages.map(msg => msg.id);
      setReadMessages(prev => {
        const newReadMessages = new Set(prev);
        messageIds.forEach(id => newReadMessages.add(id));
        return newReadMessages;
      });
    }
    
    // Clear unread count for this sender
    setUnreadCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[senderId];
      return newCounts;
    });
  };

  // Load read messages from localStorage
  useEffect(() => {
    const savedReadMessages = localStorage.getItem('readMessages');
    if (savedReadMessages) {
      try {
        const messageIds = JSON.parse(savedReadMessages);
        setReadMessages(new Set(messageIds));
      } catch (error) {
        console.error('Error loading read messages from localStorage:', error);
      }
    }
  }, []);

  // Save read messages to localStorage whenever it changes
  useEffect(() => {
    if (readMessages.size > 0) {
      localStorage.setItem('readMessages', JSON.stringify(Array.from(readMessages)));
    }
  }, [readMessages]);

  //  for user 
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      // console.log("User data fetched--", data);
      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
    };
    getUser();
  }, []);

  // for users list
  useEffect(() => {
    const fetchUsersList = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsersList(data || []);
      }
    }
    fetchUsersList();
  }, [])

  // Calculate unread counts when user loads
  useEffect(() => {
    if (user?.id) {
      calculateUnreadCounts();
    }
  }, [user]);

  // Recalculate unread counts when read messages change
  useEffect(() => {
    if (user?.id) {
      calculateUnreadCounts();
    }
  }, [readMessages]);

  // for user details
  const userDetailList = () => {
    setShowUserDetailButton(!showUserDetailButton);
  }

  // show user details function
  const showUserDetails = () => {
    setShowUserDetailButton(false);
    setShowUserDetail(true);
  }

  // send message function
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Message sent:", newMessage);
    console.log("sender :", user?.user_metadata.full_name, "id:", user?.id);
    console.log("receiver :", userToChat?.full_name, "id:", userToChat?.id);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("privatemessages")
      .insert({
        chat_id: [user?.id, userToChat?.id].sort().join("_"),
        content: newMessage,
        sender_id: user?.id,
        receiver_id: userToChat?.id,
      })
    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setNewMessage("");   // clear input
      fetchMessages();     // ✅ fetch messages again
      
      // Force scroll to bottom after sending message
      console.log("📤 Message sent, forcing scroll...");
      forceScrollToBottom();
    }
  }

  // fetch Messages component
  const fetchMessages = async () => {
    if (!user?.id || !userToChat?.id) {
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("privatemessages")
      .select("*")
      .or(
        `and(sender_id.eq.${user?.id},receiver_id.eq.${userToChat?.id}),and(sender_id.eq.${userToChat?.id},receiver_id.eq.${user?.id})`
      )
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching messages:--", error);
    } else {
      console.log("Messages fetched successfully", data);
      setMessages(data || []);
      
      // Scroll to bottom after fetching messages
      forceScrollToBottom();
    }
  };

  // for time we can use
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // fetch messages when user or userToChat changes
  useEffect(() => {
    fetchMessages();
    formatTime;
  }, [user, userToChat, setUserToChat]);

  // show user list function
  const handleShowUserList = () => {
    setShowUserList(!showUserList);
  }

  // Auto scroll when messages change
  useEffect(() => {
    if (messages.length === 0) return;

    console.log("📝 Messages changed, triggering scroll...");
    forceScrollToBottom();
  }, [messages]);

  // Add scroll event listeners to detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      const mobileContainer = document.querySelector('.mobile-messages-container');
      const desktopContainer = document.querySelector('.desktop-messages-container');
      
      const container = mobileContainer || desktopContainer;
      if (container) {
        const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
        setShowScrollButton(!isNearBottom);
      }
    };

    const mobileContainer = document.querySelector('.mobile-messages-container');
    const desktopContainer = document.querySelector('.desktop-messages-container');

    if (mobileContainer) {
      mobileContainer.addEventListener('scroll', handleScroll);
    }
    if (desktopContainer) {
      desktopContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (mobileContainer) {
        mobileContainer.removeEventListener('scroll', handleScroll);
      }
      if (desktopContainer) {
        desktopContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [userToChat]);

  // update messages at realtime
  useEffect(() => {
    console.log("Updating messages at realtime");
    if (!userToChat || !user?.id) return;

    const supabase = createClient();
    const chatId = [user.id, userToChat.id].sort().join("_");

    console.log("Setting up real-time subscription for chatId:", chatId);

    const channel = supabase
      .channel(`global-messages-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "privatemessages",
          // Remove the filter to listen to all messages
        },
        (payload) => {

          // Only process messages for this chat
          if (payload.new.chat_id === chatId) {
            console.log("📨 New message received, updating messages...");
            setMessages((prev) => [...prev, payload.new]);
            
            // Force scroll after receiving message
            forceScrollToBottom();
          } else {
            // This is a message for another chat - add to unread count
            setUnreadCounts(prev => ({
              ...prev,
              [payload.new.sender_id]: (prev[payload.new.sender_id] || 0) + 1
            }));
            
            notification(payload.new.sender_id);
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("✅ Real-time subscription active");
        }
      });

    return () => {
      console.log("🧹 Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [user, userToChat, messages]);

  // Restore on page load
  useEffect(() => {
    const savedUser = localStorage.getItem("selectedUser");
    if (savedUser) {
      setUserToChat(JSON.parse(savedUser));
    }
  }, []);

  // select user to chat function
  const handleSelectUserToChat = (u: any) => {
    setUserToChat(u);
    localStorage.setItem("selectedUser", JSON.stringify(u)); // save in localStorage
    setShowUserList(false); // hide user list on mobile after selecting a user
    setNotificationMessage(""); // clear notification on selecting user
    
    // Mark messages as read when user is selected
    markMessagesAsRead(u.id);
  }


  // for notification
  const notification = (senderId: string) => {
    console.log("Notification from:", senderId);
    if (notificationMessage !== senderId) {
      setNotificationMessage(senderId);
    }
    if (notificationMessage === senderId) {
      handleSelectUserToChat(senderId);
      setNotificationMessage("");
    }
  };

  // logout function
  const handleLogOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("selectedUser");
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  }

  // Filter users based on search query
  const filteredUsers = usersList.filter((u) => 
    u.full_name !== user?.user_metadata?.full_name &&
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`h-screen flex flex-col lg:flex-row ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} overflow-hidden`}>
      {/* Left Sidebar */}
      <div className={`hidden lg:flex flex-col w-80 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-r border-gray-200 transition-all duration-300 ease-in-out`}>
        {/* User Profile */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.user_metadata?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.user_metadata?.full_name || 'User'}</h3>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('chats')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'chats' 
                ? 'bg-blue-500 text-white' 
                : isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <RiMenuLine size={20} />
            <span>Chats</span>
          </button>
          <button 
            onClick={() => setActiveTab('calls')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'calls' 
                ? 'bg-blue-500 text-white' 
                : isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <RiPhoneLine size={20} />
            <span>Calls</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'settings' 
                ? 'bg-blue-500 text-white' 
                : isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <RiMore2Fill size={20} />
            <span>Settings</span>
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <div className="p-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-full rounded-full p-3 transition-colors flex items-center justify-center space-x-2 ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span>{isDarkMode ? '🌙' : '☀️'}</span>
            <span className="text-sm font-medium">
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
          </button>
        </div>

        {/* New Message Button */}
        <div className="p-4">
          <button className="w-full bg-blue-500 text-white rounded-full p-4 hover:bg-blue-600 transition-colors flex items-center justify-center">
            <RiAddLine size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className={`lg:hidden flex items-center justify-between px-4 py-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm`}>
        <button 
          onClick={() => setShowUserList(true)}
          className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          <RiMenuLine size={22} />
        </button>
        <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Chats</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300 bg-gray-700' : 'hover:bg-gray-100 text-gray-600 bg-gray-100'}`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden transition-all duration-300 ease-in-out">
        {/* Chat List */}
        <div className={`hidden lg:block w-80 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-r border-gray-200`}>
          {/* Header */}
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Chats</h2>
              <RiSearchLine size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            <div className="relative">
              <RiSearchLine className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={16} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map((u, index) => (
              <div
                  key={u.id}
                onClick={() => handleSelectUserToChat(u)}
                className={`p-4 border-b cursor-pointer sidebar-item transition-all duration-200 ease-in-out ${
                  isDarkMode 
                    ? `border-gray-700 hover:bg-gray-700 ${userToChat?.id === u.id ? 'bg-gray-700' : ''}`
                    : `border-gray-200 hover:bg-gray-100 ${userToChat?.id === u.id ? 'bg-blue-50' : ''}`
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeIn 0.3s ease-in-out forwards'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                      isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {u.full_name.charAt(0)}
                    </div>
                          {unreadCounts[u.id] > 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {unreadCounts[u.id]}
                            </div>
                          )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{u.full_name}</h3>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>1:41</span>
                    </div>
                    <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>See you today!</p>
                  </div>
                </div>
                </div>
              ))}
          </div>
        </div>

        {/* Mobile Chat List */}
        <div className={`lg:hidden flex-1 flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} overflow-hidden`}>
          {!userToChat ? (
            <div className="flex-1 overflow-y-auto">
              {/* Mobile Search */}
              <div className="p-4 bg-white border-b border-gray-200">
                <div className="relative">
                  <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search conversations"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
              
              {/* Mobile Chat List */}
              <div className="flex-1 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <RiMenuLine size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No conversations yet</h3>
                    <p className="text-sm text-gray-500">Start a new conversation by selecting a contact</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredUsers.map((u, index) => (
                      <div
                    key={u.id}
                        onClick={() => handleSelectUserToChat(u)}
                        className={`p-4 cursor-pointer sidebar-item transition-all duration-200 ease-in-out ${
                          isDarkMode 
                            ? 'hover:bg-gray-800 border-gray-700' 
                            : 'hover:bg-white active:bg-blue-50'
                        }`}
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animation: 'fadeIn 0.3s ease-in-out forwards'
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-semibold text-lg ${
                              isDarkMode 
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                                : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                            }`}>
                              {u.full_name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          {unreadCounts[u.id] > 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {unreadCounts[u.id]}
                            </div>
                          )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`font-semibold text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {u.full_name}
                              </h3>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                1:41
                              </span>
                            </div>
                            <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              See you today!
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-white min-h-0 overflow-hidden">
              {/* Mobile Chat Header */}
              <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setUserToChat(null)}
                      className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                      <RiArrowLeftLine size={22} />
                    </button>
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
                        isDarkMode 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                          : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      }`}>
                        {userToChat.full_name.charAt(0)}
          </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
                    <div>
                      <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {userToChat.full_name}
                      </h3>
                      <p className="text-sm text-green-500 font-medium">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                      <RiVideoLine size={20} />
                    </button>
                    <button className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                      <RiPhoneLine size={20} />
                    </button>
                </div>
            </div>
          </div>

              {/* Mobile Messages */}
              <div className={`flex-1 p-4 pb-20 overflow-y-auto message-scroll min-h-0 mobile-messages-container ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <RiMenuLine size={32} className="text-gray-400" />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Start the conversation
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Send your first message to {userToChat.full_name}
                    </p>
                </div>
              ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div
                            className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                              isMe
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                : isDarkMode
                                  ? 'bg-gray-700 text-white rounded-bl-md'
                                  : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className={`text-xs mt-2 ${isMe ? 'text-blue-100' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={mobileMessagesEndRef} />
                    <div className="h-4"></div> {/* Spacer for fixed input */}
                  </div>
                )}
                
                {/* Scroll to Bottom Button - Mobile */}
                {showScrollButton && (
                  <button
                    onClick={forceScrollToBottom}
                    className="fixed bottom-20 right-4 bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition-colors z-30 lg:hidden"
                    title="Scroll to bottom"
                  >
                    <RiArrowLeftLine size={20} className="rotate-90" />
                  </button>
                )}
              </div>

              {/* Mobile Message Input */}
              <div className={`fixed bottom-0 left-0 right-0 px-4 py-3 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-lg z-20 lg:hidden`}>
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <button 
                    type="button" 
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    <RiAttachment2 size={20} />
                  </button>
                  <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className={`w-full px-4 py-3 pr-12 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white'
                      }`}
                    />
                    <button 
                      type="button" 
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                    >
                      <RiEmojiStickerLine size={18} />
                    </button>
                  </div>
              <button
                type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    <RiSendPlaneFill size={18} />
              </button>
            </form>
          </div>
            </div>
          )}
        </div>

        {/* Desktop Chat Conversation */}
        <div className="hidden lg:flex flex-1 flex-col min-h-0 overflow-hidden">
                {userToChat ? (
            <>
              {/* Chat Header */}
              <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
                        isDarkMode 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                          : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      }`}>
                        {userToChat.full_name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                  <div>
                      <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {userToChat.full_name}
                      </h3>
                      <p className="text-sm text-green-500 font-medium">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                      <RiVideoLine size={20} />
                    </button>
                    <button className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                      <RiPhoneLine size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className={`flex-1 p-6 overflow-y-auto message-scroll min-h-0 desktop-messages-container ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                      <RiMenuLine size={40} className="text-gray-400" />
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Start the conversation
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Send your first message to {userToChat.full_name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`}
                        >
                          <div
                            className={`max-w-md px-4 py-3 rounded-2xl ${
                              isMe
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                : isDarkMode
                                  ? 'bg-gray-700 text-white rounded-bl-md'
                                  : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className={`text-xs mt-2 ${isMe ? 'text-blue-100' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={desktopMessagesEndRef} />
                    <div className="h-4"></div> {/* Spacer for fixed input */}
                  </div>
                )}
                
                {/* Scroll to Bottom Button - Desktop */}
                {showScrollButton && (
                  <button
                    onClick={forceScrollToBottom}
                    className="absolute bottom-20 right-6 bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition-colors z-30 hidden lg:block"
                    title="Scroll to bottom"
                  >
                    <RiArrowLeftLine size={20} className="rotate-90" />
                  </button>
                )}
              </div>

              {/* Message Input */}
              <div className={`sticky bottom-0 px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-lg z-10 hidden lg:block`}>
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <button 
                    type="button" 
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    <RiAttachment2 size={20} />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className={`w-full px-4 py-3 pr-12 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white'
                      }`}
                    />
                    <button 
                      type="button" 
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                    >
                      <RiEmojiStickerLine size={18} />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    <RiSendPlaneFill size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className={`flex-1 flex items-center justify-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="text-center">
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select a chat to start messaging</h3>
                <p>Choose from your contacts to begin a conversation</p>
              </div>
              </div>
            )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showUserList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden animate-fadeIn backdrop-blur-smooth">
          <div className={`w-full max-w-sm h-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl animate-slideInLeft`}>
            <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Contacts</h3>
                <button 
                  onClick={() => setShowUserList(false)}
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <RiArrowLeftLine size={22} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <RiMenuLine size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No contacts found</h3>
                  <p className="text-sm text-gray-500">Try adjusting your search</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredUsers.map((u, index) => (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUserToChat(u)}
                      className={`p-4 cursor-pointer sidebar-item transition-all duration-200 ease-in-out ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 border-gray-700' 
                          : 'hover:bg-gray-50 active:bg-blue-50'
                      }`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: 'fadeIn 0.3s ease-in-out forwards'
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
                            isDarkMode 
                              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                              : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                          }`}>
                            {u.full_name.charAt(0)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          {unreadCounts[u.id] > 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {unreadCounts[u.id]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {u.full_name}
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Online</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
