'use client';
import { use, useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { RiMore2Fill } from "react-icons/ri";
import { RxHamburgerMenu } from "react-icons/rx";
import toast, { Toaster } from "react-hot-toast";
import { FcVideoCall } from "react-icons/fc";
import { IoIosCall } from "react-icons/io";
import { IoClose } from "react-icons/io5";


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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messageCounter, setMessageCounter] = useState(0);
  const [showEditProfilePopup, setShowEditProfilePopup] = useState(false);
  const [showVideoCallPopup, setShowVideoCallPopup] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);


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

  // for edit profile
  const handleEditProfile = async () => {
    setShowEditProfilePopup(true);

    const supabase = createClient();
    const fullNameInput = user?.user_metadata.full_name || ""; 
    const { data, error} = await supabase
    .from('profiles')
    .update({ full_name: fullNameInput })
    .eq('id', user?.id);
    console.log("Profile updated:", data);
    if (error) {
      // toast.error(error.message);
      console.error("Error updating profile:", error);
    }else {
      // toast.success("Profile updated successfully");
      console.log("Profile updated successfully: ", data)
    }

  }

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

  // close user list function
  const handleCloseUserList = () => {
    setShowUserList(false);
  }

  // Auto scroll when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
            setMessages((prev) => [...prev, payload.new]);
          } else {
            notification(payload.new.sender_id); // call for notification function

            console.log("❌ Message not for this chat, ignoring");

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
    setMessageCounter(0); // clear message counter on selecting user
  }

  // for notification
  const notification = (senderId: string) => {
    console.log("Notification from:", senderId);
    if (notificationMessage !== senderId) {
      setNotificationMessage(senderId);
      setMessageCounter((prev) => prev + 1);
    }
    if (notificationMessage === senderId) {
      handleSelectUserToChat(senderId);
      setNotificationMessage("");
      setMessageCounter(0);
    }
  };

  // audio call function
  const handleAudioCall = () => {
    if (!userToChat) {
      toast.error("Please select a user to call");
      return;
    }
    toast.success(`Audio feature is coming soon! ${userToChat?.full_name}`);
  }

  // video call function
  const handleVidoeCall = async () => {
    // router.push("/videocall");
     // router.push(
    //   `/videocall?userId=${user.id}&userToChatId=${userToChat.id}&userName=${encodeURIComponent(user?.user_metadata.full_name)}&chatName=${encodeURIComponent(userToChat.full_name)}`
    // ); 
    if (!userToChat) {
      toast.error("Please select a user to call");
      return;
    } else {
      setShowVideoCallPopup(true);
      // Initialize camera when video call starts
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        setError(err.message);
      }
    }
    // toast.success(`Video feature is coming soon! ${userToChat?.full_name}`);
  }

  // end video call function
  const handleEndVideoCall = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
    setShowVideoCallPopup(false);
    setError(null);

  }


  // logout function
  const handleLogOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("selectedUser");
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-100 via-white to-blue-100 font-sans">
      {/* main Header */}
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center px-3 sm:px-6 py-3 sm:py-4 bg-white shadow-sm">
          {/* Left: Welcome + Avatar + Name — Truncated aggressively on mobile */}
          <div className="flex items-center space-x-1.5 min-w-0 flex-1">
            {user ? (
              <>
                <span className="text-pink-600 text-xs sm:text-sm font-medium whitespace-nowrap">Welcome,</span>
                <span
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-pink-400 via-purple-400 to-blue-500 
                       flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shadow shrink-0"
                  aria-label="User avatar"
                >
                  {user?.user_metadata.full_name
                    ? user.user_metadata.full_name.charAt(0).toUpperCase()
                    : "U"}
                </span>
                <span className="hidden sm:block truncate font-medium text-gray-800 text-sm">
                  {user.user_metadata.full_name || "User"}
                </span>
                <span className="sm:hidden font-medium text-gray-800 text-xs">
                  {user.user_metadata.full_name}
                </span>
              </>
            ) : (
              <span className="text-gray-500 text-xs">Loading...</span>
            )}
          </div>

          <div className="flex items-center space-x-1.5 shrink-0 ml-2">
            <button
              onClick={() => setShowEditProfilePopup(true)}
              className="px-2.5 py-1.5 text-[10px] sm:text-xs sm:px-3 sm:py-2 font-medium bg-gradient-to-r from-pink-600 to-pink-800 text-white 
                   rounded-full shadow-sm hover:from-pink-500 hover:to-pink-700 active:scale-95 
                   transition whitespace-nowrap min-w-[64px] sm:min-w-[88px]"
              aria-label="Edit Profile"
            >
              <span>Edit</span>
            </button>

            <button
              onClick={handleLogOut}
              className="px-2.5 py-1.5 text-[10px] sm:text-xs sm:px-3 sm:py-2 font-medium bg-gradient-to-r from-amber-600 to-amber-800 text-white 
                   rounded-full shadow-sm hover:from-amber-500 hover:to-amber-700 active:scale-95 
                   transition whitespace-nowrap min-w-[64px] sm:min-w-[88px]"
              aria-label="Logout"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Edit Profile Popup — Mobile Safe */}
        {showEditProfilePopup && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center pt-16 sm:pt-0 z-50 p-4">
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xl w-full max-w-sm sm:max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Edit Profile</h2>
                <button
                  onClick={() => setShowEditProfilePopup(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleEditProfile}>
                <label className="block mb-3">
                  <span className="block text-sm font-medium text-gray-700 mb-1">Full Name</span>
                  <input
                    type="text"
                    defaultValue={user?.user_metadata.full_name || ""}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                    placeholder="Enter your full name"
                  />
                </label>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                   <button
                    type="button"
                    onClick={() => setShowEditProfilePopup(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-200 text-gray-800 
                         rounded-full shadow-md hover:bg-gray-300 active:scale-95 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-pink-600 to-pink-800 text-white 
                         rounded-full shadow-md hover:from-pink-500 hover:to-pink-700 active:scale-95 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* main content */}
      <div className="flex flex-1 gap-4 p-6 bg-white  rounded-xl shadow-xl m-4">
        {/* Left Sidebar */}
        <div className="hidden md:flex flex-col w-1/5 rounded-lg border border-gray-300 bg-gradient-to-br from-pink-300 via-white to-blue-200 shadow-inner overflow-y-auto">
          <div>
            <h3 className="px-4 py-3 text-gray-700 font-bold border-b border-gray-300">
              Users
            </h3>
          </div>
          <div>
            {usersList.filter((u) => u.full_name !== user?.user_metadata?.full_name)
              .map((u) => (
                <div
                  onClick={handleSelectUserToChat.bind(null, u)}
                  key={u.id}
                  className="px-4 py-2 border-b border-gray-200 cursor-pointer bg-white/50 hover:bg-pink-100 transition rounded-md m-2 shadow-sm"
                >
                  {notificationMessage === u.id ? (
                    <div className="flex flex-row justify-between items-center">
                      <p className="text-gray-800 truncate w-full">{u.full_name}
                      </p>
                      <span className="bg-red-700 rounded-full w-7 h-6 ml-6 text-white shadow-2xl flex items-center justify-center text-sm">
                        {messageCounter}
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-800 truncate w-full">{u.full_name}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
        {/* This is only for mobile user list */}
        {showUserList && (
          <div className="absolute lg:hidden sm:top-44 z-10 top-43 left-10 w-1/3 rounded-lg border border-gray-300 bg-gradient-to-br from-pink-300 via-white to-blue-200 shadow-inner overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="px-4 py-3 text-gray-700 font-bold border-b border-gray-300">
                Users
              </h3>
              <button onClick={handleCloseUserList} className="absolute top-3 right-3 text-gray-600 hover:text-gray-800">
                <IoClose size={20} />
              </button>
            </div>
            <div>
              {usersList.filter((u) => u.id !== user?.id)

                .map((u) => (
                  <div
                    onClick={handleSelectUserToChat.bind(null, u)}
                    key={u.id}
                    className="px-4 py-2 border-b border-gray-200 cursor-pointer bg-white/50 hover:bg-pink-100 transition rounded-md m-2 shadow-sm"
                  >
                    {notificationMessage === u.id ? (
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-gray-800 truncate w-full">{u.full_name}
                        </p>
                        <span className="flex justify-center items-center bg-red-700 rounded-full w-7 h-6 ml-2 text-white shadow-2xl text-sm">
                          {messageCounter}
                        </span>
                      </div>
                    ) : (
                      <p className="text-gray-800 truncate w-full">{u.full_name}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex flex-col justify-between flex-1 rounded-lg border border-gray-300 bg-gray-50 shadow-inner">
          {/* Chat Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-100 to-gray-200 py-3 px-4 border-b border-gray-300 sm:rounded-t-lg">
            {/* Left: Hamburger Menu (mobile only) */}
            <div onClick={handleShowUserList} className="text-gray-700 lg:hidden">
              <RxHamburgerMenu size={20} />
            </div>

            {/* Center: Chat Title (Truncated gracefully) */}
            <div className="flex-1 mx-2 sm:mx-4 overflow-hidden">
              <h2 className="text-sm sm:text-base font-medium text-gray-800 text-center whitespace-nowrap overflow-hidden text-ellipsis px-1">
                Chat with{" "}
                {userToChat ? (
                  <span className="bg-gradient-to-br from-fuchsia-300 to-pink-200 text-fuchsia-900 px-2 py-1 rounded-md text-xs sm:text-sm font-medium shadow-sm truncate inline-block align-middle max-w-[120px] sm:max-w-[180px]">
                    {userToChat.full_name}
                  </span>
                ) : (
                  <span className="text-red-500 italic text-xs">Select a user</span>
                )}
              </h2>
            </div>

            {/* Right: Action Icons (Always inline, compressed on mobile) */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Video Call */}
              <div className="group relative">
                <FcVideoCall
                  size={22}
                  className="cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                  onClick={handleVidoeCall}
                />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md">
                  Video Call
                </span>
              </div>

              {/* Audio Call */}
              <div className="group relative">
                <IoIosCall
                  size={20}
                  className="cursor-pointer hover:scale-110 active:scale-95 transition-transform text-gray-700"
                  onClick={handleAudioCall}
                />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md">
                  Audio Call
                </span>
              </div>

              {/* More Menu */}
              <div className="group relative" onClick={userDetailList}>
                <RiMore2Fill
                  size={20}
                  className="cursor-pointer text-gray-700 hover:text-gray-900 active:scale-95 transition"
                />
                {showUserDetailButton && (
                  <div className="absolute top-8 -right-4 max-w-fit bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                    <button
                      onClick={showUserDetails}
                      className="block w-full text-left text-sm text-gray-800 hover:bg-gray-100 px-2 py-1.5 rounded"
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Call Popup (unchanged, but centered & mobile-safe) */}
          {showVideoCallPopup && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4">
              <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl p-4 sm:p-6 flex flex-col items-center">
                <div className="absolute top-3 right-3">
                  <button
                    onClick={handleEndVideoCall}
                    className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                  >
                    &times;
                  </button>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
                  Video Call with {userToChat?.full_name}
                </h2>

                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-4xl">
                  {/* Local Video */}
                  <div className="flex flex-col items-center flex-1">
                    <h3 className="text-gray-600 text-sm mb-2">You</h3>
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full max-w-xs sm:max-w-sm h-48 sm:h-64 bg-black rounded-lg shadow-md transform scale-x-[-1]"
                    />
                  </div>

                  {/* Remote Video Placeholder */}
                  <div className="flex flex-col items-center flex-1">
                    <h3 className="text-gray-600 text-sm mb-2">Remote</h3>
                    <div className="w-full max-w-xs sm:max-w-sm h-48 sm:h-64 bg-gray-800 rounded-lg shadow-md flex items-center justify-center">
                      <p className="text-gray-300 text-xs sm:text-sm text-center px-2">
                        Connecting to {userToChat?.full_name}...
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleEndVideoCall}
                  className="mt-6 px-6 py-2.5 bg-red-600 text-white font-medium rounded-full shadow-md hover:bg-red-500 active:scale-95 transition transform"
                >
                  End Call
                </button>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex flex-col text-gray-700 h-[500px]">
            <div className="flex-1 p-6 overflow-y-auto text-gray-700">
              {messages.length === 0 ? (
                <div className="flex justify-center items-center text-gray-500 italic">
                  No messages yet...
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-xs break-words shadow-md ${isMe
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                          }`}
                      >
                        <div className="flex flex-row gap-2 justify-center items-center">
                          <span className="block">{msg.content}</span>
                          <span className="flex text-[12px] pt-2">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Box */}
          <div className="border-t border-gray-300 bg-white rounded-b-lg">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3 px-4 py-3">
              <input
                type="text"
                required
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm"
              />
              <button
                type="submit"
                disabled={!userToChat}
                className={`px-5 py-2 rounded-full shadow-md transition 
                ${userToChat
                    ? "bg-gradient-to-r from-amber-600 to-amber-800 text-white hover:from-amber-500 hover:to-amber-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
              >
                Send
              </button>
            </form>
          </div>
          {/* toast for audio and video call */}
          <Toaster position="top-right" reverseOrder={false} />
        </div>

        {/* Right Sidebar */}
        <div className="hidden md:flex flex-col w-1/5 rounded-lg border border-gray-300 bg-gradient-to-br from-pink-300 via-white to-blue-200 shadow-inner overflow-y-auto">
          <h3 className="px-4 py-3 text-gray-700 font-bold border-b border-gray-300">
            Info
          </h3>
          <div className="flex-1 flex justify-center text-gray-600 italic">
            {showUserDetail && (
              <div className="mt-4 p-4 shadow">
                <h4 className="text-lg font-semibold mb-2">User Details</h4>
                {userToChat ? (
                  <div>
                    <p><span className="font-bold">Name:</span> {userToChat.full_name}</p>
                    <p><span className="font-bold">id:</span> {userToChat.id}</p>
                  </div>
                ) : (
                  <p className="text-red-500 italic">No user selected</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

  );
}
