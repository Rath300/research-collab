'use client';
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
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { FiX, FiHash, FiAlertCircle } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { createResearchPost } from '@/lib/api';
export default function CreatePostModal(_a) {
    var _this = this;
    var onClose = _a.onClose, onPostCreated = _a.onPostCreated;
    var user = useAuthStore().user;
    var _b = useState(''), title = _b[0], setTitle = _b[1];
    var _c = useState(''), content = _c[0], setContent = _c[1];
    var _d = useState(''), tagInput = _d[0], setTagInput = _d[1];
    var _e = useState([]), tags = _e[0], setTags = _e[1];
    var _f = useState('public'), visibility = _f[0], setVisibility = _f[1];
    var _g = useState(false), isLoading = _g[0], setIsLoading = _g[1];
    var _h = useState(''), error = _h[0], setError = _h[1];
    var handleAddTag = function () {
        var trimmedTag = tagInput.trim();
        if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
            setTags(__spreadArray(__spreadArray([], tags, true), [trimmedTag], false));
            setTagInput('');
        }
    };
    var handleRemoveTag = function (tagToRemove) {
        setTags(tags.filter(function (tag) { return tag !== tagToRemove; }));
    };
    var handleKeyDown = function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!title.trim() || !content.trim()) {
                        setError('Please fill in all required fields');
                        return [2 /*return*/];
                    }
                    if (!user) {
                        setError('You must be logged in to create a post');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setIsLoading(true);
                    setError('');
                    return [4 /*yield*/, createResearchPost({
                            title: title,
                            content: content,
                            user_id: user.id,
                            tags: tags.length > 0 ? tags : undefined,
                            visibility: visibility,
                            is_boosted: false,
                            engagement_count: 0,
                        })];
                case 2:
                    _a.sent();
                    onPostCreated();
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error creating post:', err_1);
                    setError(err_1.message || 'Failed to create post. Please try again.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create Research Post</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close" className="h-8 w-8 p-0">
            <FiX size={18}/>
          </Button>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (<div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center space-x-2 text-sm dark:bg-red-900/20 dark:text-red-400">
                <FiAlertCircle className="h-5 w-5 flex-shrink-0"/>
                <span>{error}</span>
              </div>)}
            
            <Input label="Title" placeholder="Enter your research title" value={title} onChange={function (e) { return setTitle(e.target.value); }} required maxLength={100}/>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                Content
              </label>
              <textarea className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[200px] disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900" placeholder="Describe your research, findings, or questions..." value={content} onChange={function (e) { return setContent(e.target.value); }} required/>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                Tags (up to 5)
              </label>
              <div className="flex items-center space-x-2">
                <Input placeholder="Add a tag (e.g., Machine Learning)" value={tagInput} onChange={function (e) { return setTagInput(e.target.value); }} onKeyDown={handleKeyDown} className="flex-1"/>
                <Button type="button" onClick={handleAddTag} disabled={!tagInput.trim() || tags.length >= 5}>
                  Add
                </Button>
              </div>
              
              {tags.length > 0 && (<div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(function (tag) { return (<div key={tag} className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm flex items-center space-x-1 dark:bg-primary-900/20 dark:text-primary-300">
                      <FiHash size={12}/>
                      <span>{tag}</span>
                      <button type="button" onClick={function () { return handleRemoveTag(tag); }} className="ml-1 hover:text-red-500 focus:outline-none">
                        <FiX size={14}/>
                      </button>
                    </div>); })}
                </div>)}
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                Visibility
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={function () { return setVisibility('public'); }} className="h-4 w-4 text-primary-600 focus:ring-primary-500"/>
                  <span className="text-sm">Public</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="visibility" value="connections" checked={visibility === 'connections'} onChange={function () { return setVisibility('connections'); }} className="h-4 w-4 text-primary-600 focus:ring-primary-500"/>
                  <span className="text-sm">Connections Only</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="visibility" value="private" checked={visibility === 'private'} onChange={function () { return setVisibility('private'); }} className="h-4 w-4 text-primary-600 focus:ring-primary-500"/>
                  <span className="text-sm">Private</span>
                </label>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            
            <Button type="submit" isLoading={isLoading}>
              Publish
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>);
}
