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
    <div className="p-4 border-r border-zinc-800">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={selectedUser.imageUrl} />
          <AvatarFallback>{selectedUser.fullName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium">{selectedUser.fullName}</h2>
          <p className="text-sm text-zinc-400">{statusText}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeaderBar;
