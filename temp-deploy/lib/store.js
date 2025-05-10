var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { create } from 'zustand';
export var useAuthStore = create(function (set) { return ({
    user: null,
    profile: null,
    isLoading: true,
    setUser: function (user) { return set({ user: user }); },
    setProfile: function (profile) { return set({ profile: profile }); },
    setLoading: function (isLoading) { return set({ isLoading: isLoading }); },
    signOut: function () { return set({ user: null, profile: null }); },
}); });
export var useSwipeStore = create(function (set) { return ({
    swipedUsers: [],
    likedUsers: [],
    matches: [],
    addSwipedUser: function (userId) { return set(function (state) { return ({
        swipedUsers: __spreadArray(__spreadArray([], state.swipedUsers, true), [userId], false),
    }); }); },
    addLikedUser: function (userId) { return set(function (state) { return ({
        likedUsers: __spreadArray(__spreadArray([], state.likedUsers, true), [userId], false),
    }); }); },
    setMatches: function (matches) { return set({ matches: matches }); },
    addMatch: function (match) { return set(function (state) { return ({
        matches: __spreadArray(__spreadArray([], state.matches, true), [match], false),
    }); }); },
    resetSwipeState: function () { return set({ swipedUsers: [], likedUsers: [] }); },
}); });
export var useChatStore = create(function (set) { return ({
    currentChatUserId: null,
    unreadMessages: {},
    setCurrentChatUserId: function (userId) { return set({ currentChatUserId: userId }); },
    setUnreadCount: function (userId, count) { return set(function (state) {
        var _a;
        return ({
            unreadMessages: __assign(__assign({}, state.unreadMessages), (_a = {}, _a[userId] = count, _a)),
        });
    }); },
    incrementUnreadCount: function (userId) { return set(function (state) {
        var _a;
        return ({
            unreadMessages: __assign(__assign({}, state.unreadMessages), (_a = {}, _a[userId] = (state.unreadMessages[userId] || 0) + 1, _a)),
        });
    }); },
    resetUnreadCount: function (userId) { return set(function (state) {
        var _a;
        return ({
            unreadMessages: __assign(__assign({}, state.unreadMessages), (_a = {}, _a[userId] = 0, _a)),
        });
    }); },
}); });
export var useUIStore = create(function (set) { return ({
    sidebarOpen: false,
    darkMode: typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false,
    toggleSidebar: function () { return set(function (state) { return ({ sidebarOpen: !state.sidebarOpen }); }); },
    setSidebarOpen: function (open) { return set({ sidebarOpen: open }); },
    toggleDarkMode: function () { return set(function (state) { return ({ darkMode: !state.darkMode }); }); },
    setDarkMode: function (enabled) { return set({ darkMode: enabled }); },
}); });
export var useResearchStore = create(function (set) { return ({
    posts: [],
    isLoading: false,
    hasMore: true,
    setPosts: function (posts) { return set({ posts: posts }); },
    appendPosts: function (posts) { return set(function (state) { return ({
        posts: __spreadArray(__spreadArray([], state.posts, true), posts, true),
    }); }); },
    setLoading: function (isLoading) { return set({ isLoading: isLoading }); },
    setHasMore: function (hasMore) { return set({ hasMore: hasMore }); },
    resetPosts: function () { return set({ posts: [], hasMore: true }); },
}); });
