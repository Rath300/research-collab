'use client';
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FiUsers, FiMessageSquare, FiTrendingUp, FiSearch, FiChevronRight, FiPlus, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { getBrowserClient } from '@/lib/supabase';
import { ResearchPostCard } from '@/components/research/ResearchPostCard';
export default function DashboardPage() {
    var _this = this;
    var router = useRouter();
    var _a = useAuthStore(), user = _a.user, profile = _a.profile;
    var _b = useState({
        postCount: 0,
        matchCount: 0,
        messageCount: 0,
        viewCount: 0
    }), stats = _b[0], setStats = _b[1];
    var _c = useState([]), recentMatches = _c[0], setRecentMatches = _c[1];
    var _d = useState([]), recentPosts = _d[0], setRecentPosts = _d[1];
    var _e = useState(true), isLoading = _e[0], setIsLoading = _e[1];
    var loadDashboardData = function () { return __awaiter(_this, void 0, void 0, function () {
        var supabase, _a, postCount, postError, _b, matchCount, matchCountError, _c, messageCount, messageCountError, _d, profileData, profileError, _e, matches, matchesError, transformedMatches, _f, posts, postsError, error_1;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 7, 8, 9]);
                    if (!user)
                        return [2 /*return*/];
                    setIsLoading(true);
                    supabase = getBrowserClient();
                    return [4 /*yield*/, supabase
                            .from('research_posts')
                            .select('*', { count: 'exact', head: true })
                            .eq('user_id', user.id)];
                case 1:
                    _a = _g.sent(), postCount = _a.count, postError = _a.error;
                    return [4 /*yield*/, supabase
                            .from('matches')
                            .select('*', { count: 'exact', head: true })
                            .or("user_id_1.eq.".concat(user.id, ",user_id_2.eq.").concat(user.id))
                            .eq('status', 'matched')];
                case 2:
                    _b = _g.sent(), matchCount = _b.count, matchCountError = _b.error;
                    return [4 /*yield*/, supabase
                            .from('messages')
                            .select('*', { count: 'exact', head: true })
                            .or("sender_id.eq.".concat(user.id, ",receiver_id.eq.").concat(user.id))];
                case 3:
                    _c = _g.sent(), messageCount = _c.count, messageCountError = _c.error;
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('view_count')
                            .eq('id', user.id)
                            .single()];
                case 4:
                    _d = _g.sent(), profileData = _d.data, profileError = _d.error;
                    setStats({
                        postCount: postCount || 0,
                        matchCount: matchCount || 0,
                        messageCount: messageCount || 0,
                        viewCount: (profileData === null || profileData === void 0 ? void 0 : profileData.view_count) || 0
                    });
                    return [4 /*yield*/, supabase
                            .from('matches')
                            .select("\n          *,\n          user1:user_id_1(id, first_name, last_name, avatar_url, title, institution),\n          user2:user_id_2(id, first_name, last_name, avatar_url, title, institution)\n        ")
                            .or("user_id_1.eq.".concat(user.id, ",user_id_2.eq.").concat(user.id))
                            .eq('status', 'matched')
                            .limit(3)];
                case 5:
                    _e = _g.sent(), matches = _e.data, matchesError = _e.error;
                    if (matches) {
                        transformedMatches = matches.map(function (match) {
                            var otherUser = match.user_id_1 === user.id ? match.user2 : match.user1;
                            return __assign(__assign({}, match), { profiles: otherUser });
                        });
                        setRecentMatches(transformedMatches);
                    }
                    return [4 /*yield*/, supabase
                            .from('research_posts')
                            .select('*, profiles:user_id(first_name, last_name, avatar_url, title)')
                            .eq('visibility', 'public')
                            .order('created_at', { ascending: false })
                            .limit(3)];
                case 6:
                    _f = _g.sent(), posts = _f.data, postsError = _f.error;
                    if (posts) {
                        setRecentPosts(posts);
                    }
                    return [3 /*break*/, 9];
                case 7:
                    error_1 = _g.sent();
                    console.error('Error loading dashboard data:', error_1);
                    return [3 /*break*/, 9];
                case 8:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        if (user) {
            loadDashboardData();
        }
    }, [user]);
    if (!user || !profile) {
        // Redirect to login if not authenticated
        router.push('/login');
        return null;
    }
    return (<div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1 dark:text-gray-400">
            Welcome back, {profile.first_name}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 space-x-2">
          <Button onClick={function () { return router.push('/research/new'); }}>
            <FiPlus className="mr-2"/>
            New Post
          </Button>
          
          <Button variant="outline" onClick={function () { return router.push('/collaborators'); }}>
            <FiUsers className="mr-2"/>
            Find Collaborators
          </Button>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Research Posts</p>
                <h3 className="text-3xl font-bold mt-1">{stats.postCount}</h3>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <FiBarChart2 size={24}/>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Collaborator Matches</p>
                <h3 className="text-3xl font-bold mt-1">{stats.matchCount}</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <FiUsers size={24}/>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Messages</p>
                <h3 className="text-3xl font-bold mt-1">{stats.messageCount}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <FiMessageSquare size={24}/>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile Views</p>
                <h3 className="text-3xl font-bold mt-1">{stats.viewCount}</h3>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <FiTrendingUp size={24}/>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Recent Matches</CardTitle>
                <Button variant="ghost" className="p-0 h-auto text-sm font-medium text-primary-600 dark:text-primary-400" onClick={function () { return router.push('/chats'); }}>
                  View All
                  <FiChevronRight size={16} className="ml-1"/>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (<div className="flex justify-center items-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
                </div>) : recentMatches.length > 0 ? (<div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentMatches.map(function (match) {
                // Get the other user's ID and profile
                var otherUserId = match.user_id_1 === user.id ? match.user_id_2 : match.user_id_1;
                var otherUserProfile = match.profiles;
                var fullName = "".concat(otherUserProfile.first_name, " ").concat(otherUserProfile.last_name);
                return (<div key={match.id} className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors" onClick={function () { return router.push("/chats?id=".concat(otherUserId)); }}>
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden mr-3">
                          {otherUserProfile.avatar_url ? (<img src={otherUserProfile.avatar_url} alt={fullName} className="h-full w-full object-cover"/>) : (<FiUsers className="text-primary-600" size={20}/>)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{fullName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {otherUserProfile.institution || 'Researcher'}
                          </p>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="ml-2">
                          <FiMessageSquare size={18}/>
                        </Button>
                      </div>);
            })}
                </div>) : (<div className="text-center py-8 px-4">
                  <FiUsers size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2"/>
                  <p className="text-gray-500 dark:text-gray-400">No matches yet</p>
                  <Button variant="outline" className="mt-4" onClick={function () { return router.push('/collaborators'); }}>
                    Find Collaborators
                  </Button>
                </div>)}
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Feed Posts */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Recent Research Posts</CardTitle>
                <Button variant="ghost" className="p-0 h-auto text-sm font-medium text-primary-600 dark:text-primary-400" onClick={function () { return router.push('/research'); }}>
                  View All
                  <FiChevronRight size={16} className="ml-1"/>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (<div className="flex justify-center items-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
                </div>) : recentPosts.length > 0 ? (<div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentPosts.map(function (post) { return (<div key={post.id} className="p-4">
                      <ResearchPostCard post={post} onClick={function () { return router.push("/research/".concat(post.id)); }}/>
                    </div>); })}
                </div>) : (<div className="text-center py-8 px-4">
                  <FiSearch size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2"/>
                  <p className="text-gray-500 dark:text-gray-400">No research posts yet</p>
                  <Button variant="outline" className="mt-4" onClick={function () { return router.push('/research/new'); }}>
                    Create a Post
                  </Button>
                </div>)}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={function () { return router.push('/profile/edit'); }}>
              <FiUsers size={24} className="mb-2"/>
              <span>Update Profile</span>
            </Button>
            
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={function () { return router.push('/research/new'); }}>
              <FiPlus size={24} className="mb-2"/>
              <span>Add Research</span>
            </Button>
            
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={function () { return router.push('/collaborators'); }}>
              <FiSearch size={24} className="mb-2"/>
              <span>Find Collaborators</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Upcoming Events */}
      <Card>
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Upcoming Research Events</CardTitle>
            <Button variant="ghost" className="p-0 h-auto text-sm font-medium text-primary-600 dark:text-primary-400" onClick={function () { return router.push('/events'); }}>
              View All
              <FiChevronRight size={16} className="ml-1"/>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-center py-8 px-4">
            <FiCalendar size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2"/>
            <p className="text-gray-500 dark:text-gray-400">
              No upcoming events at this time
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Check back later for conferences, workshops, and networking opportunities
            </p>
          </div>
        </CardContent>
      </Card>
    </div>);
}
