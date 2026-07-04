import Topbar from "@/components/Topbar";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import UsersList from "./components/UsersList";
import ChatHeaderBar from "./components/ChatHeaderBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import MessageInputArea from "./components/MessageInputArea";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const ChatPage = () => {
  const { user } = useUser();
  const { messages, selectedUser, fetchUsers, userActivities } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const selectedUserActivity = selectedUser
    ? userActivities.get(selectedUser.clerkId)
    : "";
  const isSelectedUserTyping =
    !!selectedUser &&
    !!user &&
    !!selectedUserActivity &&
    selectedUserActivity.includes("typing...") &&
    selectedUserActivity.includes(`to:${user.id}`);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length, selectedUser?.clerkId, isSelectedUserTyping]);

  return (
    <main className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-lg border border-zinc-800/70 bg-zinc-950 text-zinc-100">
      <Topbar />
      <div className="grid min-h-0 overflow-hidden border-t border-zinc-800/70 grid-cols-[76px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Sidebar - User List */}
        <UsersList />
        {/* Chat Area */}
        <div className="grid h-full min-h-0 min-w-0 overflow-hidden bg-linear-to-b from-zinc-900 to-zinc-950 grid-rows-[auto_minmax(0,1fr)_auto]">
          {selectedUser ? (
            /* ChatWindow component would go here */
            <>
              <ChatHeaderBar />
              <div className="relative min-h-0 overflow-hidden">
                <ScrollArea className="h-full min-h-0">
                  {/* Messages would be rendered here */}
                  <div className="min-h-full space-y-4 px-4 py-5 md:px-6">
                    {messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex items-end gap-3 ${
                          msg.senderId === user?.id ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar className="size-8 shrink-0 md:size-10">
                          <AvatarImage
                            src={
                              msg.senderId === user?.id
                                ? user.imageUrl
                                : selectedUser?.imageUrl
                            }
                          />
                        </Avatar>
                        <div
                          className={`max-w-[75%] rounded-2xl px-3 py-2 shadow-sm md:max-w-[68%] ${
                            msg.senderId === user?.id
                              ? "rounded-br-md bg-emerald-500 text-white"
                              : "rounded-bl-md bg-zinc-800 text-zinc-100"
                          }`}
                        >
                          <p className="break-words text-sm leading-relaxed">
                            {msg.content}
                          </p>
                          <span
                            className={`mt-1 block text-[11px] ${
                              msg.senderId === user?.id
                                ? "text-emerald-100/80"
                                : "text-zinc-500"
                            }`}
                          >
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}

                    {isSelectedUserTyping && (
                      <div className="flex items-end gap-3">
                        <Avatar className="size-8 shrink-0 md:size-10">
                          <AvatarImage src={selectedUser.imageUrl} />
                        </Avatar>
                        <div className="rounded-2xl rounded-bl-md bg-zinc-800 px-3 py-2 shadow-sm">
                          <div className="flex gap-1 items-end">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.2s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.1s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* MessageInput component would go here */}
              <MessageInputArea />
            </>
          ) : (
            <div className="row-span-3 min-h-0">
              <NoConversationSelected />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ChatPage;

const NoConversationSelected = () => (
  <div className="flex h-full flex-col items-center justify-center space-y-6 bg-zinc-950 px-6 text-center">
    <img
      src="/logo-2.png"
      alt="No conversation selected"
      className="size-16 animate-bounce rounded-full"
    />
    <div>
      <h3 className="text-zinc-300 text-lg font-medium mb-1">
        No conversation selected
      </h3>
      <p className="text-zinc-500 text-sm">Select a user to start chatting</p>
    </div>
  </div>
);
