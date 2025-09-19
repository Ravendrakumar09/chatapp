'use client';
import { use, useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { RiMore2Fill } from "react-icons/ri";
import { RxHamburgerMenu } from "react-icons/rx";
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);


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

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-100 via-white to-blue-100 font-sans">
      {/* Header */}
      <div className="flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 bg-white shadow-lg">
          <div className="text-lg font-semibold text-gray-800">
            {user ? (
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="text-pink-600">Welcome,</span>{" "}
                {user.user_metadata.full_name}
              </span>
            ) : (
              "Loading..."
            )}
          </div>
          <button
            onClick={handleLogOut}
            className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-full shadow-md hover:from-amber-500 hover:to-amber-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* main content */}
      <div className="flex flex-1 gap-4 p-6 bg-white  rounded-xl shadow-xl m-4">
        {/* Left Sidebar */}
        <div className="hidden md:flex flex-col w-1/5 rounded-lg border border-gray-300 bg-gradient-to-br from-pink-300 via-white to-blue-200 shadow-inner overflow-y-auto">
          <h3 className="px-4 py-3 text-gray-700 font-bold border-b border-gray-300">
            Users
          </h3>
          <div>
            {usersList.filter((u) => u.full_name !== user?.user_metadata?.full_name)
              .map((u) => (
                <div
                  onClick={handleSelectUserToChat.bind(null, u)}
                  key={u.id}
                  className="px-4 py-2 border-b border-gray-200 cursor-pointer bg-white/50 hover:bg-pink-100 transition rounded-md m-2 shadow-sm"
                >
                  {notificationMessage === u.id ? (
                    <div className="text-center text-sm text-red-600 font-bold animate-bounce rounded-2xl">
                      <p className="text-gray-800 bg-red-600 rounded-2xl truncate w-full">{u.full_name}</p>
                    </div>
                  ) : (
                    <p className="text-gray-800 truncate w-full">{u.full_name}</p>
                  )}
                </div>
              ))}
          </div>
        </div>

        {showUserList && (
          <div className="absolute lg:hidden sm:top-44 z-10 top-43 left-10 w-1/3 rounded-lg border border-gray-300 bg-gradient-to-br from-pink-300 via-white to-blue-200 shadow-inner overflow-y-auto">
            <h3 className="px-4 py-3 text-gray-700 font-bold border-b border-gray-300">
              Users
            </h3>
            <div>
              {usersList.filter((u) => u.id !== user?.id)

                .map((u) => (
                  <div
                    onClick={handleSelectUserToChat.bind(null, u)}
                    key={u.id}
                    className="px-4 py-2 border-b border-gray-200 cursor-pointer bg-white/50 hover:bg-pink-100 transition rounded-md m-2 shadow-sm"
                  >
                    {notificationMessage === u.id ? (
                      <div className="text-center text-sm text-red-600 font-bold animate-bounce rounded-2xl p-1">
                        <p className="text-gray-800 bg-red-600 truncate w-full rounded-2xl p-1">{u.full_name}</p>
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
          <div className="flex justify-between bg-gradient-to-r from-gray-200 to-gray-300 py-4 px-6 border-b border-gray-400 rounded-t-lg">
            <div onClick={handleShowUserList} className="text-gray-600 font-bold block lg:hidden">
              <RxHamburgerMenu className="inline mr-1" size={22} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Chat with{" "}
              {userToChat ? (
                <span className="bg-gradient-to-br px-3 py-1 rounded-lg text-shadow-red-900 italic bg-fuchsia-300 shadow truncate w-full">
                  {userToChat.full_name}
                </span>
              ) : (
                <span className="text-red-500 italic">Select a user</span>
              )}
            </h2>
            <div>
              <p onClick={userDetailList} className="text-sm text-gray-600 hover:">
                <RiMore2Fill className="inline mr-1" size={22} />
              </p>
              {showUserDetailButton && (
                <div onClick={showUserDetails} className="absolute w-28 bg-white border border-gray-300 rounded-lg shadow-lg p-2">
                  <h3 className="text-black">View Details</h3>
                </div>
              )}
            </div>
          </div>

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
