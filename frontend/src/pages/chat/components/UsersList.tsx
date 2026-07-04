import UsersListSkeleton from "@/components/skeletons/UsersListSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";

const UsersList = () => {
  const {
    users,
    selectedUser,
    selectUser,
    isLoading,
    onlineUsers,
    userActivities,
    unreadMessages,
  } = useChatStore();
  const { user: authUser } = useUser();
  const onlineCount = users.filter((user) =>
    onlineUsers.has(user.clerkId)
  ).length;
  const sortedUsers = [...users].sort((a, b) => {
    const aOnline = onlineUsers.has(a.clerkId);
    const bOnline = onlineUsers.has(b.clerkId);

    if (aOnline !== bOnline) return aOnline ? -1 : 1;
    return a.fullName.localeCompare(b.fullName);
  });

  return (
    <aside className="grid h-full min-h-0 overflow-hidden border-r border-zinc-800/70 bg-zinc-950/70 grid-rows-[auto_minmax(0,1fr)]">
      <div className="hidden shrink-0 border-b border-zinc-800/70 px-4 py-3 lg:block">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white">
              Messages
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {onlineCount} online / {users.length} total
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-full min-h-0">
        <div className="space-y-1 p-2 lg:p-3">
          {isLoading ? (
            <UsersListSkeleton />
          ) : sortedUsers.length === 0 ? (
            <div className="hidden px-2 py-8 text-center text-sm text-zinc-500 lg:block">
              No users found
            </div>
          ) : (
            sortedUsers.map((user) => {
              const unreadCount = unreadMessages.get(user.clerkId) || 0;
              const isOnline = onlineUsers.has(user.clerkId);
              const shouldShowUnread = isOnline && unreadCount > 0;
              const unreadLabel = unreadCount > 99 ? "99+" : unreadCount;
              const activity = userActivities.get(user.clerkId);
              const isTyping =
                isOnline &&
                !!authUser &&
                !!activity &&
                activity.includes("typing...") &&
                activity.includes(`to:${authUser.id}`);
              const statusText =
                shouldShowUnread
                  ? unreadCount === 1
                    ? "1 new message"
                    : `${unreadCount} new messages`
                  : isTyping
                  ? "Typing..."
                  : isOnline
                  ? "Online"
                  : "Offline";

              return (
                <div
                  key={user._id}
                  onClick={() => selectUser(user)}
                  className={`flex min-h-16 w-full min-w-0 items-center justify-center gap-3 overflow-hidden rounded-md p-2 transition-colors lg:justify-start lg:p-3
                        ${
                          selectedUser?.clerkId === user.clerkId
                            ? "bg-zinc-800/90"
                            : "hover:bg-zinc-800/50"
                        }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="size-10 lg:size-11">
                      <AvatarImage src={user.imageUrl} />
                      <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-zinc-950 ${
                        isOnline ? "bg-green-500" : "bg-zinc-600"
                      }`}
                    />
                    {shouldShowUnread && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-black ring-2 ring-zinc-950 lg:hidden">
                        {unreadLabel}
                      </span>
                    )}
                  </div>
                  <div className="hidden min-w-0 flex-1 lg:block">
                    <span
                      className={`block truncate text-sm ${
                        shouldShowUnread
                          ? "font-semibold text-white"
                          : "font-medium text-zinc-100"
                      }`}
                    >
                      {user.fullName}
                    </span>
                    <p
                      className={`mt-0.5 truncate text-xs ${
                        shouldShowUnread
                          ? "text-emerald-400"
                          : isOnline
                          ? "text-zinc-500"
                          : "text-zinc-600"
                      }`}
                    >
                      {statusText}
                    </p>
                  </div>
                  {shouldShowUnread && (
                    <span className="hidden h-6 min-w-6 max-w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-2 text-xs font-bold text-black lg:flex">
                      {unreadLabel}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default UsersList;
