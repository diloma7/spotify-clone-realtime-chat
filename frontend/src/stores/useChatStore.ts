import { apiOrigin, axiosInstance } from "@/lib/axios";
import { create } from "zustand";
import { io } from "socket.io-client";
import type { Message, User } from "@/types";

interface ChatStore {
  users: User[];
  isLoading: boolean;
  error: string | null;
  socket: any;
  isConnected: boolean;
  onlineUsers: Set<string>;
  userActivities: Map<string, string>;
  lastPlayingActivity: Map<string, string>;
  unreadMessages: Map<string, number>;
  messages: Message[];
  selectedUser: User | null;

  fetchUsers: () => Promise<void>;
  initSocket: (getToken: () => Promise<string | null>) => void;
  disconnectSocket: () => void;
  sendMessage: (receiverId: string, content: string) => void;
  fetchMessages: (userId: string) => Promise<void>;
  markMessagesRead: (userId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  selectUser: (user: User) => Promise<void>;
  updateActivity: (
    userId: string,
    activity: string,
    targetUserId?: string
  ) => void;
}

const socket = io(apiOrigin || undefined, {
  autoConnect: false, // only connect if user is authenticated
  withCredentials: true,
});

export const useChatStore = create<ChatStore>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  socket: socket,
  isConnected: false,
  onlineUsers: new Set(),
  userActivities: new Map(),
  lastPlayingActivity: new Map(),
  unreadMessages: new Map(),
  messages: [],
  selectedUser: null,

  setSelectedUser: (user) => set({ selectedUser: user }),
  selectUser: async (user) => {
    set((state) => {
      const unreadMessages = new Map(state.unreadMessages);
      unreadMessages.delete(user.clerkId);

      return { selectedUser: user, messages: [], unreadMessages };
    });
    await get().fetchMessages(user.clerkId);
  },

  markMessagesRead: async (userId) => {
    set((state) => {
      const unreadMessages = new Map(state.unreadMessages);
      unreadMessages.delete(userId);

      return { unreadMessages };
    });

    try {
      await axiosInstance.patch(`/users/messages/${userId}/read`);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateActivity: (userId: string, activity: string, targetUserId?: string) => {
    const socket = get().socket;
    if (!socket) return;
    const current = get().userActivities.get(userId) ?? "";
    const lastPlaying = get().lastPlayingActivity.get(userId) ?? "";

    let finalActivity = activity;

    // Track the latest playing state so typing/idle events don't lose it.
    if (activity.startsWith("Playing ")) {
      finalActivity = activity;
    }

    if (activity === "typing...") {
      const basePlaying = current.startsWith("Playing ")
        ? current.replace(" | typing...", "")
        : lastPlaying;

      if (basePlaying) {
        finalActivity = `${basePlaying} | typing...`;
      } else if (current.includes("| typing...")) {
        finalActivity = current;
      } else {
        finalActivity = "typing...";
      }

      if (targetUserId) {
        if (!finalActivity.includes(`to:${targetUserId}`)) {
          finalActivity = `${finalActivity} | to:${targetUserId}`;
        }
      }
    }

    if (activity === "Idle") {
      const basePlaying = current.startsWith("Playing ")
        ? current.replace(" | typing...", "")
        : lastPlaying;
      if (basePlaying) {
        finalActivity = basePlaying;
      } else if (current.includes("| typing...")) {
        finalActivity = current.replace(" | typing...", "");
      } else {
        finalActivity = "Idle";
      }
    }

    // Remove any lingering target markers when not actively typing
    if (activity === "Idle" || activity.startsWith("Playing ")) {
      finalActivity = finalActivity.replace(/ \| to:[^|]+/g, "");
    }

    socket.emit("update_activity", { activity: finalActivity });

    set((state) => {
      const newActivities = new Map(state.userActivities);
      newActivities.set(userId, finalActivity);
      const newLastPlaying = new Map(state.lastPlayingActivity);
      if (finalActivity.startsWith("Playing ")) {
        newLastPlaying.set(userId, finalActivity.replace(" | typing...", ""));
      }
      return {
        userActivities: newActivities,
        lastPlayingActivity: newLastPlaying,
      };
    });
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/users");
      const usersData = Array.isArray(response.data)
        ? response.data
        : response.data.users || [];
      const unreadMessages = new Map<string, number>();

      usersData.forEach((user: User) => {
        if (user.unreadCount && user.unreadCount > 0) {
          unreadMessages.set(user.clerkId, user.unreadCount);
        }
      });

      set({ users: usersData, unreadMessages });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  initSocket: (getToken) => {
    if (!get().isConnected) {
      socket.removeAllListeners();
      socket.auth = async (callback: (auth: { token?: string }) => void) => {
        try {
          const token = await getToken();
          callback(token ? { token } : {});
        } catch {
          callback({});
        }
      };
      socket.connect();

      socket.on("connect", () => {
        void get().fetchUsers();
      });

      socket.on("users_online", (users: string[]) => {
        set({ onlineUsers: new Set(users) });
      });

      socket.on("activities", (activities: [string, string][]) => {
        set((state) => {
          const newActivities = new Map(activities);
          const newLastPlaying = new Map(state.lastPlayingActivity);
          newActivities.forEach((activity, userId) => {
            if (activity.startsWith("Playing ")) {
              newLastPlaying.set(userId, activity.replace(" | typing...", ""));
            }
          });
          return {
            userActivities: newActivities,
            lastPlayingActivity: newLastPlaying,
          };
        });
      });

      socket.on("user_connected", (userId: string) => {
        set((state) => ({
          onlineUsers: new Set([...state.onlineUsers, userId]),
        }));
      });

      socket.on("user_disconnected", (userId: string) => {
        set((state) => {
          const newOnlineUsers = new Set(state.onlineUsers);
          newOnlineUsers.delete(userId);
          return { onlineUsers: newOnlineUsers };
        });
      });

      socket.on("receive_message", (message: Message) => {
        const isActiveConversation =
          get().selectedUser?.clerkId === message.senderId;

        if (isActiveConversation) {
          void get().markMessagesRead(message.senderId);
        }

        set((state) => {
          const isSelectedConversation =
            state.selectedUser?.clerkId === message.senderId;

          if (isSelectedConversation) {
            const unreadMessages = new Map(state.unreadMessages);
            unreadMessages.delete(message.senderId);

            return {
              messages: [...state.messages, message],
              unreadMessages,
            };
          }

          const unreadMessages = new Map(state.unreadMessages);
          unreadMessages.set(
            message.senderId,
            (unreadMessages.get(message.senderId) || 0) + 1
          );

          return { unreadMessages };
        });
      });

      socket.on("message_sent", (message: Message) => {
        set((state) => {
          if (state.selectedUser?.clerkId !== message.receiverId) {
            return state;
          }

          return {
            messages: [...state.messages, message],
          };
        });
      });

      socket.on(
        "activity_updated",
        ({ userId, activity }: { userId: string; activity: string }) => {
          set((state) => {
            const newActivities = new Map(state.userActivities);
            newActivities.set(userId, activity);
            const newLastPlaying = new Map(state.lastPlayingActivity);
            if (activity.startsWith("Playing ")) {
              newLastPlaying.set(userId, activity.replace(" | typing...", ""));
            }
            return {
              userActivities: newActivities,
              lastPlayingActivity: newLastPlaying,
            };
          });
        }
      );

      set({ isConnected: true });
    }
  },

  disconnectSocket: () => {
    socket.disconnect();
    socket.removeAllListeners();
    set({ isConnected: false });
  },

  sendMessage: async (receiverId, content) => {
    const socket = get().socket;
    if (!socket) return;

    socket.emit("send_message", { receiverId, content });
  },

  fetchMessages: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/users/messages/${userId}`);
      const messagesData = Array.isArray(response.data)
        ? response.data
        : response.data.messages || [];
      set({ messages: messagesData });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
