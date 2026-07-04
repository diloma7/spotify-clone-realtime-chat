import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";

const ChatHeaderBar = () => {
  const { selectedUser, onlineUsers, userActivities } = useChatStore();
  const { user } = useUser();
  if (!selectedUser) return null;

  const activity = userActivities.get(selectedUser.clerkId);
  const isOnline = onlineUsers.has(selectedUser.clerkId);
  const isTyping =
    !!activity &&
    activity.includes("typing...") &&
    user &&
    activity.includes(`to:${user.id}`);
  const statusText = isTyping ? "Typing..." : isOnline ? "Online" : "Offline";

  return (
    <div className="shrink-0 border-b border-zinc-800/70 bg-zinc-950/90 px-4 py-3 md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={selectedUser.imageUrl} />
          <AvatarFallback>{selectedUser.fullName[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-white">
            {selectedUser.fullName}
          </h2>
          <p
            className={`text-xs ${
              isTyping ? "text-emerald-400" : "text-zinc-400"
            }`}
          >
            {statusText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeaderBar;
