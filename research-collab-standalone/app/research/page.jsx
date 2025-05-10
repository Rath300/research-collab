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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ResearchPostCard } from '@/components/research/ResearchPostCard';
import { FiPlus, FiSearch, FiFilter, FiTag } from 'react-icons/fi';
import { useResearchStore, useAuthStore } from '@/lib/store';
import { getResearchPosts, updateResearchPost } from '@/lib/api';
import CreatePostModal from '@/components/research/CreatePostModal';
export default function ResearchPage() {
    var _this = this;
    var searchParams = useSearchParams();
    var tagParam = searchParams.get('tag');
    var _a = useResearchStore(), posts = _a.posts, isLoading = _a.isLoading, hasMore = _a.hasMore, setPosts = _a.setPosts, appendPosts = _a.appendPosts, setLoading = _a.setLoading, setHasMore = _a.setHasMore, resetPosts = _a.resetPosts;
    var user = useAuthStore().user;
    var _b = useState(''), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = useState(tagParam ? [tagParam] : []), selectedTags = _c[0], setSelectedTags = _c[1];
    var _d = useState(0), offset = _d[0], setOffset = _d[1];
    var _e = useState(false), showCreateModal = _e[0], setShowCreateModal = _e[1];
    var loadPosts = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (reset) {
            var currentOffset, newPosts, error_1;
            if (reset === void 0) { reset = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        if (reset) {
                            setLoading(true);
                            resetPosts();
                            setOffset(0);
                        }
                        if (isLoading || (!hasMore && !reset))
                            return [2 /*return*/];
                        setLoading(true);
                        currentOffset = reset ? 0 : offset;
                        return [4 /*yield*/, getResearchPosts({
                                tags: selectedTags.length > 0 ? selectedTags : undefined,
                                limit: 10,
                                offset: currentOffset,
                            })];
                    case 1:
                        newPosts = _a.sent();
                        if (reset) {
                            setPosts(newPosts);
                        }
                        else {
                            appendPosts(newPosts);
                        }
                        setOffset(currentOffset + newPosts.length);
                        setHasMore(newPosts.length === 10);
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error loading posts:', error_1);
                        return [3 /*break*/, 4];
                    case 3:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Initial load and when filters change
    useEffect(function () {
        loadPosts(true);
    }, [selectedTags]);
    // When tag param changes
    useEffect(function () {
        if (tagParam) {
            setSelectedTags([tagParam]);
        }
    }, [tagParam]);
    var handleLike = function (postId) { return __awaiter(_this, void 0, void 0, function () {
        var post, updatedPost_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    post = posts.find(function (p) { return p.id === postId; });
                    if (!post)
                        return [2 /*return*/];
                    updatedPost_1 = __assign(__assign({}, post), { engagement_count: post.engagement_count + 1 });
                    // Update in state
                    setPosts(posts.map(function (p) { return (p.id === postId ? updatedPost_1 : p); }));
                    // Update in the database
                    return [4 /*yield*/, updateResearchPost({
                            id: postId,
                            engagement_count: updatedPost_1.engagement_count,
                        })];
                case 2:
                    // Update in the database
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error liking post:', error_2);
                    // Revert on error
                    loadPosts(true);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleBoost = function (postId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // This would open a modal to purchase a boost with Stripe
            alert('Boost feature coming soon!');
            return [2 /*return*/];
        });
    }); };
    // Handle infinite scroll
    var handleScroll = function () {
        if (window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - 500) {
            if (!isLoading && hasMore) {
                loadPosts();
            }
        }
    };
    useEffect(function () {
        window.addEventListener('scroll', handleScroll);
        return function () { return window.removeEventListener('scroll', handleScroll); };
    }, [isLoading, hasMore, offset]);
    var toggleTag = function (tag) {
        setSelectedTags(function (prev) {
            return prev.includes(tag) ? prev.filter(function (t) { return t !== tag; }) : __spreadArray(__spreadArray([], prev, true), [tag], false);
        });
    };
    return (<div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Research Feed</h1>
        
        <Button onClick={function () { return setShowCreateModal(true); }} leftIcon={<FiPlus />}>
          Create Post
        </Button>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <Input placeholder="Search research posts..." value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} className="flex-1" leftIcon={<FiSearch />}/>
          
          <Button variant="outline" leftIcon={<FiFilter />}>
            Filter
          </Button>
        </div>
        
        {/* Tags */}
        {popularTags.length > 0 && (<div className="flex flex-wrap gap-2">
            {popularTags.map(function (tag) { return (<button key={tag} onClick={function () { return toggleTag(tag); }} className={"px-3 py-1.5 rounded-full text-sm flex items-center ".concat(selectedTags.includes(tag)
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700')}>
                <FiTag size={14} className="mr-1.5"/>
                {tag}
              </button>); })}
          </div>)}
      </div>
      
      {/* Research Posts */}
      <div className="space-y-6">
        {posts.length > 0 ? (posts.map(function (post) { return (<ResearchPostCard key={post.id} post={post} onLike={handleLike} onBoost={handleBoost}/>); })) : !isLoading ? (<div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">No research posts found</p>
            {selectedTags.length > 0 && (<Button variant="ghost" onClick={function () { return setSelectedTags([]); }}>
                Clear filters
              </Button>)}
          </div>) : null}
        
        {isLoading && (<div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
          </div>)}
        
        {!isLoading && !hasMore && posts.length > 0 && (<p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No more posts to load
          </p>)}
      </div>
      
      {showCreateModal && (<CreatePostModal onClose={function () { return setShowCreateModal(false); }} onPostCreated={function () {
                setShowCreateModal(false);
                loadPosts(true);
            }}/>)}
    </div>);
}
// Some popular tags for filtering
var popularTags = [
    'Machine Learning',
    'Computer Science',
    'Physics',
    'Biology',
    'Chemistry',
    'Mathematics',
    'Economics',
    'Psychology',
    'Neuroscience',
];
