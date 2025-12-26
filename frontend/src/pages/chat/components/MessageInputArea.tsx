import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { Send } from "lucide-react";
import { useRef, useState } from "react";

const MessageInputArea = () => {
  const [newMessage, setNewMessage] = useState("");
  const { user } = useUser();
  const { selectedUser, sendMessage, updateActivity } = useChatStore();
  const typingTimeoutRef = useRef<number | null>(null);

  const handleSend = () => {
    if (!selectedUser || !user || !newMessage) return;
    sendMessage(selectedUser.clerkId, user.id, newMessage.trim());
    setNewMessage("");

    // Reset typing state to Idle after sending a message
    updateActivity(user.id, "Idle", selectedUser?.clerkId);
  };

  return (
    <div className="mt-auto border-t border-zinc-800">
      <div className="flex gap-3">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => {
            const value = e.target.value;
            setNewMessage(value);

            if (!user) return;

            // Mark as typing while there is content and debounce
            // resetting back to Idle to avoid spamming the server.
            if (typingTimeoutRef.current) {
              window.clearTimeout(typingTimeoutRef.current);
            }

            if (value.trim().length > 0) {
              updateActivity(user.id, "typing...", selectedUser?.clerkId);
              typingTimeoutRef.current = window.setTimeout(() => {
                updateActivity(user.id, "Idle", selectedUser?.clerkId);
              }, 1500);
            } else {
              updateActivity(user.id, "Idle", selectedUser?.clerkId);
            }
          }}
          className="bg-zinc-800 border-none"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button
          size={"icon"}
          disabled={!newMessage.trim()}
          onClick={handleSend}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInputArea;
