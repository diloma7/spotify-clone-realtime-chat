import { axiosInstance } from "@/lib/axios";
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
  messages: Message[];
  selectedUser: User | null;

  fetchUsers: () => Promise<void>;
  initSocket: (userId: string) => void;
  disconnectSocket: () => void;
  sendMessage: (receiverId: string, senderId: string, content: string) => void;
  fetchMessages: (userId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  selectUser: (user: User) => Promise<void>;
  updateActivity: (
    userId: string,
    activity: string,
    targetUserId?: string
  ) => void;
}

const baseURL = (() => {
  const configuredBase = (import.meta.env.VITE_API_URL as string | undefined)
    ?.trim()
    .replace(/\/$/, "");

  // Default to the nginx entrypoint when running locally.
  return configuredBase || "http://localhost:8080";
})();

const socket = io(baseURL, {
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
  messages: [],
  selectedUser: null,

  setSelectedUser: (user) => set({ selectedUser: user }),
  selectUser: async (user) => {
    set({ selectedUser: user, messages: [] });
    await get().fetchMessages(user.clerkId);
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

    socket.emit("update_activity", { userId, activity: finalActivity });

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
      set({ users: usersData });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  initSocket: (userId) => {
    if (!get().isConnected) {
      socket.auth = { userId };
      socket.connect();

      // Ensure presence is registered on every (re)connect, not just
      // the initial connection. Socket.IO fires `connect` again after
      // automatic reconnects, so this keeps the online user list
      // accurate without requiring a full page refresh.
      socket.on("connect", () => {
        socket.emit("user_connected", userId);
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
        set((state) => ({
          messages: [...state.messages, message],
        }));
      });

      socket.on("message_sent", (message: Message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
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
    if (get().isConnected) {
      socket.disconnect();
      set({ isConnected: false });
    }
  },

  sendMessage: async (receiverId, senderId, content) => {
    const socket = get().socket;
    if (!socket) return;

    socket.emit("send_message", { receiverId, senderId, content });
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
