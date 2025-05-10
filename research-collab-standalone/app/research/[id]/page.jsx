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
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { FiUser, FiThumbsUp, FiMessageSquare, FiShare2, FiZap, FiTag, FiArrowLeft } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { getResearchPost, updateResearchPost, deleteResearchPost } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
export default function ResearchPostPage() {
    var _this = this;
    var _a, _b;
    var router = useRouter();
    var params = useParams();
    var user = useAuthStore().user;
    var _c = useState(null), post = _c[0], setPost = _c[1];
    var _d = useState(true), isLoading = _d[0], setIsLoading = _d[1];
    var _e = useState(''), error = _e[0], setError = _e[1];
    var _f = useState(false), showDeleteConfirm = _f[0], setShowDeleteConfirm = _f[1];
    var loadPost = function () { return __awaiter(_this, void 0, void 0, function () {
        var postData, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    setError('');
                    return [4 /*yield*/, getResearchPost(params.id)];
                case 1:
                    postData = _a.sent();
                    setPost(postData);
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    console.error('Error loading post:', err_1);
                    setError(err_1.message || 'Failed to load research post');
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        loadPost();
    }, [params.id]);
    var handleLike = function () { return __awaiter(_this, void 0, void 0, function () {
        var updatedPost, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!post || !user)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    updatedPost = __assign(__assign({}, post), { engagement_count: post.engagement_count + 1 });
                    setPost(updatedPost);
                    // Update in the database
                    return [4 /*yield*/, updateResearchPost(post.id, {
                            engagement_count: updatedPost.engagement_count,
                        })];
                case 2:
                    // Update in the database
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error liking post:', error_1);
                    // Revert on error
                    loadPost();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleShare = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, navigator.clipboard.writeText(window.location.href)];
                case 1:
                    _a.sent();
                    alert('Link copied to clipboard!');
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error copying to clipboard:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleDeletePost = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!post || !user)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    setIsLoading(true);
                    // Delete the post
                    return [4 /*yield*/, deleteResearchPost(post.id)];
                case 2:
                    // Delete the post
                    _a.sent();
                    // Redirect to research feed
                    router.push('/research');
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error deleting post:', error_3);
                    setError('Failed to delete post. Please try again.');
                    setIsLoading(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return (<div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
        </div>
      </div>);
    }
    if (error || !post) {
        return (<div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
          <p className="text-red-500 dark:text-red-400 mb-4">{error || 'Post not found'}</p>
          <Button variant="outline" onClick={function () { return router.push('/research'); }}>
            Back to Research Feed
          </Button>
        </div>
      </div>);
    }
    var createdAt = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : '';
    var isAuthor = user && post.user_id === user.id;
    var fullName = post.profiles ? "".concat(post.profiles.first_name, " ").concat(post.profiles.last_name) : 'Unknown User';
    var institution = ((_a = post.profiles) === null || _a === void 0 ? void 0 : _a.institution) || 'Independent Researcher';
    return (<div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4">
        <Button variant="ghost" className="px-0 py-0 h-auto text-primary-600 dark:text-primary-400" onClick={function () { return router.push('/research'); }}>
          <FiArrowLeft className="mr-2"/>
          Back to Research Feed
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Post header with user info */}
          <div className="flex items-center space-x-3">
            <Link href={"/profile/".concat(post.user_id)} className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {((_b = post.profiles) === null || _b === void 0 ? void 0 : _b.avatar_url) ? (<img src={post.profiles.avatar_url} alt={fullName} className="h-full w-full object-cover"/>) : (<FiUser className="text-primary-600" size={24}/>)}
              </div>
            </Link>
            
            <div className="flex-1 min-w-0">
              <Link href={"/profile/".concat(post.user_id)} className="hover:underline">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {fullName}
                </p>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {institution} • {createdAt}
              </p>
            </div>
            
            {post.is_boosted && (<div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center text-sm font-medium dark:bg-yellow-900/30 dark:text-yellow-400">
                <FiZap size={16} className="mr-1.5"/>
                Boosted
              </div>)}
          </div>
          
          {/* Post title and content */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>
            
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {post.content}
              </p>
            </div>
          </div>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (<div className="flex flex-wrap gap-2 pt-2">
              {post.tags.map(function (tag) { return (<Link key={tag} href={"/research?tag=".concat(encodeURIComponent(tag))} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-md flex items-center hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                  <FiTag size={14} className="mr-1.5"/>
                  {tag}
                </Link>); })}
            </div>)}
          
          {/* Actions */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex flex-wrap justify-between items-center">
            <div className="flex space-x-2 sm:space-x-4">
              <Button variant="ghost" size="sm" onClick={handleLike} className="text-gray-600 dark:text-gray-400">
                <FiThumbsUp size={18} className="mr-1.5"/>
                <span>{post.engagement_count || 0}</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                <FiMessageSquare size={18} className="mr-1.5"/>
                <span>Comment</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400" onClick={handleShare}>
                <FiShare2 size={18} className="mr-1.5"/>
                <span>Share</span>
              </Button>
            </div>
            
            {isAuthor && (<div className="flex space-x-2 mt-4 sm:mt-0">
                <Button variant="outline" size="sm" onClick={function () { return router.push("/research/edit/".concat(post.id)); }}>
                  Edit
                </Button>
                
                {showDeleteConfirm ? (<>
                    <Button variant="destructive" size="sm" onClick={handleDeletePost} isLoading={isLoading}>
                      Confirm
                    </Button>
                    <Button variant="ghost" size="sm" onClick={function () { return setShowDeleteConfirm(false); }}>
                      Cancel
                    </Button>
                  </>) : (<Button variant="destructive" size="sm" onClick={function () { return setShowDeleteConfirm(true); }}>
                    Delete
                  </Button>)}
              </div>)}
          </div>
          
          {/* Comments section could be added here */}
        </CardContent>
      </Card>
    </div>);
}
