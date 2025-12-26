import Topbar from "@/components/Topbar";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
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

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  return (
    <main className="h-full rounded-lg bg-linear-to-b from-zinc-800 to-zinc-900 overflow-hidden">
      <Topbar />
      <div className="grid lg:grid-cols-[300px_1fr] grid-cols-[80px_1fr] h-[calc(100vh-250px)]">
        {/* Sidebar - User List */}
        <UsersList />
        {/* Chat Area */}
        <div className="flex flex-col h-full">
          {selectedUser ? (
            /* ChatWindow component would go here */
            <>
              <ChatHeaderBar />
              <ScrollArea className="h-[calc(100vh-340px)]">
                {/* Messages would be rendered here */}
                <div className="p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex items-center gap-3 ${
                        msg.senderId === user?.id ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="size-8 md:size-12">
                        <AvatarImage
                          src={
                            msg.senderId === user?.id
                              ? user.imageUrl
                              : selectedUser?.imageUrl
                          }
                        />
                      </Avatar>
                      <div
                        className={`rounded-lg p-3 max-w-[70%] ${
                          msg.senderId === user?.id
                            ? "bg-green-500"
                            : "bg-zinc-800"
                        }`}
                      >
                        <p className="text-sm ">{msg.content}</p>
                        <span className="text-xs text-zinc-500 mt-1 block">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator for the other user */}
                  {selectedUser &&
                    userActivities
                      .get(selectedUser.clerkId)
                      ?.includes("typing...") &&
                    user &&
                    userActivities
                      .get(selectedUser.clerkId)
                      ?.includes(`to:${user.id}`) && (
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8 md:size-12">
                          <AvatarImage src={selectedUser.imageUrl} />
                        </Avatar>
                        <div className="rounded-lg p-3 max-w-[70%] bg-zinc-800">
                          <div className="flex gap-1 items-end">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.2s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.1s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </ScrollArea>

              {/* MessageInput component would go here */}
              <MessageInputArea />
            </>
          ) : (
            <NoConversationSelected />
          )}
        </div>
      </div>
    </main>
  );
};

export default ChatPage;

const NoConversationSelected = () => (
  <div className="flex flex-col items-center justify-center h-full space-y-6">
    <img
      src="/logo-2.png"
      alt="No conversation selected"
      className="size-16 animate-bounce rounded-full"
    />
    <div className="text-center">
      <h3 className="text-zinc-300 text-lg font-medium mb-1">
        No conversation selected
      </h3>
      <p className="text-zinc-500 text-sm">Select a user to start chatting</p>
    </div>
  </div>
);
