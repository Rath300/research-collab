import { create } from 'zustand';
import { Profile, ResearchPost, Match } from '@research-collab/db';

interface AuthState {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: any | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (isLoading: boolean) => void;
  signOut: () => void;
}

interface SwipeState {
  swipedUsers: string[];
  likedUsers: string[];
  matches: Match[];
  addSwipedUser: (userId: string) => void;
  addLikedUser: (userId: string) => void;
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;
  resetSwipeState: () => void;
}

interface ChatState {
  currentChatUserId: string | null;
  unreadMessages: Record<string, number>;
  setCurrentChatUserId: (userId: string | null) => void;
  setUnreadCount: (userId: string, count: number) => void;
  incrementUnreadCount: (userId: string) => void;
  resetUnreadCount: (userId: string) => void;
}

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
}

interface ResearchState {
  posts: ResearchPost[];
  isLoading: boolean;
  hasMore: boolean;
  setPosts: (posts: ResearchPost[]) => void;
  appendPosts: (posts: ResearchPost[]) => void;
  setLoading: (isLoading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  resetPosts: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ user: null, profile: null }),
}));

export const useSwipeStore = create<SwipeState>((set) => ({
  swipedUsers: [],
  likedUsers: [],
  matches: [],
  addSwipedUser: (userId) => set((state) => ({
    swipedUsers: [...state.swipedUsers, userId],
  })),
  addLikedUser: (userId) => set((state) => ({
    likedUsers: [...state.likedUsers, userId],
  })),
  setMatches: (matches) => set({ matches }),
  addMatch: (match) => set((state) => ({
    matches: [...state.matches, match],
  })),
  resetSwipeState: () => set({ swipedUsers: [], likedUsers: [] }),
}));

export const useChatStore = create<ChatState>((set) => ({
  currentChatUserId: null,
  unreadMessages: {},
  setCurrentChatUserId: (userId) => set({ currentChatUserId: userId }),
  setUnreadCount: (userId, count) => set((state) => ({
    unreadMessages: { ...state.unreadMessages, [userId]: count },
  })),
  incrementUnreadCount: (userId) => set((state) => ({
    unreadMessages: {
      ...state.unreadMessages,
      [userId]: (state.unreadMessages[userId] || 0) + 1,
    },
  })),
  resetUnreadCount: (userId) => set((state) => ({
    unreadMessages: { ...state.unreadMessages, [userId]: 0 },
  })),
}));

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  darkMode: typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-color-scheme: dark)').matches 
    : false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setDarkMode: (enabled) => set({ darkMode: enabled }),
}));

export const useResearchStore = create<ResearchState>((set) => ({
  posts: [],
  isLoading: false,
  hasMore: true,
  setPosts: (posts) => set({ posts }),
  appendPosts: (posts) => set((state) => ({
    posts: [...state.posts, ...posts],
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setHasMore: (hasMore) => set({ hasMore }),
  resetPosts: () => set({ posts: [], hasMore: true }),
})); 