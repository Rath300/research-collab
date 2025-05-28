import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ResearchPost, Match, type Profile as DbProfile } from '@research-collab/db';

// Define Profile type based on the database schema
// type ProfileFromDb = Database['public']['Tables']['profiles']['Row'];

export interface AuthState {
  user: any | null;
  profile: DbProfile | null;
  isLoading: boolean;
  hasAttemptedProfileFetch: boolean;
  setUser: (user: any | null) => void;
  setProfile: (profile: DbProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setHasAttemptedProfileFetch: (attempted: boolean) => void;
  markTourAsCompletedInStore: () => void;
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      hasAttemptedProfileFetch: false,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile, hasAttemptedProfileFetch: true }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasAttemptedProfileFetch: (attempted) => set({ hasAttemptedProfileFetch: attempted }),
      markTourAsCompletedInStore: () => set((state) => {
        if (state.profile) {
          return { profile: { ...state.profile, has_completed_tour: true } };
        }
        return {};
      }),
      clearAuth: () => set({ 
        user: null, 
        profile: null, 
        isLoading: false, 
        hasAttemptedProfileFetch: true, 
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        profile: state.profile, 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('[AuthStore] Successfully rehydrated state from localStorage.');
        }
      }
    }
  )
);

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