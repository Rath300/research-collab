import { create } from 'zustand';
import { ResearchPost, Match, type Profile as DbProfile } from '@research-collab/db';
import type { User } from '@supabase/supabase-js';

// Define Profile type based on the database schema
// type ProfileFromDb = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: User | null;
  profile: DbProfile | null;
  isLoading: boolean;
  authError: string | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: DbProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setAuthError: (error: string | null) => void;
  signOut: () => void;
  clearAuth: () => void;
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
  totalUnreadMessages: number;
  setCurrentChatUserId: (userId: string | null) => void;
  setUnreadCount: (userId: string, count: number) => void;
  incrementUnreadCount: (userId: string) => void;
  resetUnreadCount: (userId: string) => void;
  setTotalUnreadMessages: (count: number) => void;
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  authError: null,
  setUser: (newUser) => {
    const currentUser = get().user;
    if (currentUser?.id !== newUser?.id || 
        (currentUser === null && newUser !== null) || 
        (currentUser !== null && newUser === null)) {
      set({ user: newUser });
    }
  },
  setProfile: (newProfile) => set({ profile: newProfile }),
  setLoading: (isLoading) => set({ isLoading }),
  setAuthError: (authError) => set({ authError }),
  signOut: () => set({ user: null, profile: null, isLoading: false, authError: null }),
  clearAuth: () => set({ user: null, profile: null, isLoading: false, authError: null }),
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
  resetSwipeState: () => set({ swipedUsers: [], likedUsers: [], matches: [] }),
}));

export const useChatStore = create<ChatState>((set, get) => ({
  currentChatUserId: null,
  unreadMessages: {},
  totalUnreadMessages: 0,
  setCurrentChatUserId: (userId) => set({ currentChatUserId: userId }),
  setUnreadCount: (userId, count) => {
    const currentUnread = get().unreadMessages[userId] || 0;
    const newTotal = get().totalUnreadMessages - currentUnread + count;
    set((state) => ({
      unreadMessages: { ...state.unreadMessages, [userId]: count },
      totalUnreadMessages: Math.max(0, newTotal),
    }));
  },
  incrementUnreadCount: (userId) => {
    set((state) => ({
      unreadMessages: {
        ...state.unreadMessages,
        [userId]: (state.unreadMessages[userId] || 0) + 1,
      },
      totalUnreadMessages: state.totalUnreadMessages + 1,
    }));
  },
  resetUnreadCount: (userId) => {
    const currentUnread = get().unreadMessages[userId] || 0;
    set((state) => ({
      unreadMessages: { ...state.unreadMessages, [userId]: 0 },
      totalUnreadMessages: Math.max(0, state.totalUnreadMessages - currentUnread),
    }));
  },
  setTotalUnreadMessages: (count) => set({ totalUnreadMessages: count }),
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
  resetPosts: () => set({ posts: [], isLoading: false, hasMore: true }),
}));

// Example selector (optional, but can be useful)
export const selectIsAuthenticated = (state: AuthState) => !!state.user;
export const selectUserProfile = (state: AuthState) => state.profile;
export const selectAuthLoading = (state: AuthState) => state.isLoading;
export const selectAuthError = (state: AuthState) => state.authError;

// Re-export User and DbProfile types if they are frequently used with the store context
export type { User as SupabaseUser, DbProfile as UserProfile };

// Note: If using `persist` middleware, ensure it's configured correctly.
// For sensitive auth data, consider if localStorage is appropriate or if session storage / in-memory is better.
// The current setup without `persist` means the store is in-memory and resets on full page reload,
// relying on AuthProvider to re-initialize from Supabase session. 