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
import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { FiSend, FiSearch, FiUser, FiEdit, FiMoreVertical, FiChevronLeft } from 'react-icons/fi';
import { useAuthStore, useChatStore } from '@/lib/store';
// Import Supabase client directly
import { getBrowserClient } from '@/lib/supabase';
// Wrapper component for client-side only features
function ChatPageContent() {
    var _this = this;
    var router = useRouter();
    var searchParams = useSearchParams();
    var chatId = searchParams === null || searchParams === void 0 ? void 0 : searchParams.get('id');
    var user = useAuthStore().user;
    var _a = useChatStore(), currentChatUserId = _a.currentChatUserId, unreadMessages = _a.unreadMessages, setCurrentChatUserId = _a.setCurrentChatUserId, setUnreadCount = _a.setUnreadCount;
    var _b = useState([]), matchesList = _b[0], setMatchesList = _b[1];
    var _c = useState([]), messagesList = _c[0], setMessagesList = _c[1];
    var _d = useState(''), messageText = _d[0], setMessageText = _d[1];
    var _e = useState(true), isLoading = _e[0], setIsLoading = _e[1];
    var _f = useState(false), isSending = _f[0], setIsSending = _f[1];
    var _g = useState(''), error = _g[0], setError = _g[1];
    var _h = useState(null), selectedMatch = _h[0], setSelectedMatch = _h[1];
    var messagesEndRef = useRef(null);
    var _j = useState(false), showMobileChat = _j[0], setShowMobileChat = _j[1];
    // Load user matches directly using Supabase
    var loadMatches = function () { return __awaiter(_this, void 0, void 0, function () {
        var supabase, _a, data, matchError, match, chatUserId, firstMatch, chatUserId, match, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    if (!user)
                        return [2 /*return*/];
                    setIsLoading(true);
                    setError('');
                    supabase = getBrowserClient();
                    return [4 /*yield*/, supabase
                            .from('matches')
                            .select("\n          *,\n          user1:user_id_1(id, first_name, last_name, avatar_url, title, institution),\n          user2:user_id_2(id, first_name, last_name, avatar_url, title, institution)\n        ")
                            .or("user_id_1.eq.".concat(user.id, ",user_id_2.eq.").concat(user.id))
                            .eq('status', 'matched')];
                case 1:
                    _a = _b.sent(), data = _a.data, matchError = _a.error;
                    if (matchError)
                        throw matchError;
                    // Cast data to the expected type
                    setMatchesList(data);
                    // If chatId is set, select that chat
                    if (chatId) {
                        match = data.find(function (m) {
                            return m.user_id_1 === chatId || m.user_id_2 === chatId;
                        });
                        if (match) {
                            chatUserId = match.user_id_1 === user.id
                                ? match.user_id_2
                                : match.user_id_1;
                            setCurrentChatUserId(chatUserId);
                            setSelectedMatch(match);
                            setShowMobileChat(true);
                        }
                    }
                    else if (data.length > 0 && !currentChatUserId) {
                        firstMatch = data[0];
                        chatUserId = firstMatch.user_id_1 === user.id
                            ? firstMatch.user_id_2
                            : firstMatch.user_id_1;
                        setCurrentChatUserId(chatUserId);
                        setSelectedMatch(firstMatch);
                    }
                    else if (currentChatUserId) {
                        match = data.find(function (m) {
                            return m.user_id_1 === currentChatUserId || m.user_id_2 === currentChatUserId;
                        });
                        if (match) {
                            setSelectedMatch(match);
                            setShowMobileChat(true);
                        }
                    }
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _b.sent();
                    console.error('Error loading matches:', err_1);
                    setError(err_1.message || 'Failed to load conversations');
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Load chat messages
    var loadMessages = function () { return __awaiter(_this, void 0, void 0, function () {
        var matchId, supabase, _a, data, messagesError, transformedMessages, updateError, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, 4, 5]);
                    if (!user || !currentChatUserId || !selectedMatch)
                        return [2 /*return*/];
                    setIsLoading(true);
                    matchId = selectedMatch.id;
                    supabase = getBrowserClient();
                    return [4 /*yield*/, supabase
                            .from('messages')
                            .select('*, sender:sender_id(first_name, last_name, avatar_url), receiver:receiver_id(first_name, last_name, avatar_url)')
                            .eq('match_id', matchId)
                            .order('created_at', { ascending: false })];
                case 1:
                    _a = _b.sent(), data = _a.data, messagesError = _a.error;
                    if (messagesError)
                        throw messagesError;
                    transformedMessages = (data || []).map(function (msg) { return (__assign(__assign({}, msg), { is_self: msg.sender_id === user.id, read: msg.is_read // Map is_read to read for compatibility
                     })); });
                    setMessagesList(transformedMessages);
                    return [4 /*yield*/, supabase
                            .from('messages')
                            .update({ is_read: true })
                            .eq('match_id', matchId)
                            .eq('receiver_id', user.id)
                            .eq('is_read', false)];
                case 2:
                    updateError = (_b.sent()).error;
                    if (updateError)
                        throw updateError;
                    setUnreadCount(currentChatUserId, 0);
                    // Scroll to bottom
                    scrollToBottom();
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _b.sent();
                    console.error('Error loading messages:', err_2);
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        if (user) {
            loadMatches();
        }
    }, [user]);
    useEffect(function () {
        if (currentChatUserId && selectedMatch) {
            loadMessages();
        }
    }, [currentChatUserId, selectedMatch]);
    var scrollToBottom = function () {
        setTimeout(function () {
            var _a;
            (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };
    var handleSendMessage = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var messageData, supabase, _a, newMessage, error_1, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (e)
                        e.preventDefault();
                    if (!messageText.trim() || !user || !currentChatUserId || !selectedMatch)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    setIsSending(true);
                    messageData = {
                        content: messageText.trim(),
                        sender_id: user.id,
                        receiver_id: currentChatUserId,
                        match_id: selectedMatch.id,
                        is_read: false,
                    };
                    supabase = getBrowserClient();
                    return [4 /*yield*/, supabase
                            .from('messages')
                            .insert(messageData)
                            .select()
                            .single()];
                case 2:
                    _a = _b.sent(), newMessage = _a.data, error_1 = _a.error;
                    if (error_1)
                        throw error_1;
                    // Add message to list with is_self flag as a custom property
                    setMessagesList(__spreadArray(__spreadArray([], messagesList, true), [__assign(__assign({}, newMessage), { is_self: true, read: false })], false));
                    // Clear input
                    setMessageText('');
                    // Scroll to bottom
                    scrollToBottom();
                    return [3 /*break*/, 5];
                case 3:
                    err_3 = _b.sent();
                    console.error('Error sending message:', err_3);
                    return [3 /*break*/, 5];
                case 4:
                    setIsSending(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleKeyDown = function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    var handleSelectChat = function (match) {
        var chatUserId = match.user_id_1 === (user === null || user === void 0 ? void 0 : user.id)
            ? match.user_id_2
            : match.user_id_1;
        setCurrentChatUserId(chatUserId);
        setSelectedMatch(match);
        setShowMobileChat(true);
        // Update URL
        router.push("/chats?id=".concat(chatUserId));
    };
    var getOtherUserFullName = function (match) {
        return "".concat(match.profiles.first_name, " ").concat(match.profiles.last_name);
    };
    if (!user) {
        // Redirect to login if not authenticated
        router.push('/login');
        return null;
    }
    return (<div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] bg-white rounded-lg shadow-md overflow-hidden dark:bg-slate-800">
        {/* Chat list - hidden on mobile when a chat is selected */}
        <div className={"w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 ".concat(showMobileChat ? 'hidden md:block' : 'block')}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Input placeholder="Search conversations..." className="pr-10"/>
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18}/>
            </div>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {matchesList.length > 0 ? (matchesList.map(function (match) {
            var chatUserId = match.user_id_1 === user.id
                ? match.user_id_2
                : match.user_id_1;
            var isSelected = currentChatUserId === chatUserId;
            var unreadCount = unreadMessages[chatUserId] || 0;
            return (<div key={match.id} className={"p-4 border-b border-gray-100 dark:border-gray-700 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ".concat(isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : '')} onClick={function () { return handleSelectChat(match); }}>
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                      {match.profiles.avatar_url ? (<img src={match.profiles.avatar_url} alt={getOtherUserFullName(match)} className="h-full w-full object-cover"/>) : (<FiUser className="text-primary-600" size={24}/>)}
                    </div>
                    
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className={"text-sm font-medium truncate ".concat(unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200')}>
                          {getOtherUserFullName(match)}
                        </p>
                        
                        {unreadCount > 0 && (<span className="ml-1 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount}
                          </span>)}
                      </div>
                      
                      <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                        {match.profiles.institution || 'Researcher'}
                      </p>
                    </div>
                  </div>);
        })) : isLoading ? (<div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
              </div>) : (<div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Match with researchers to start chatting
                </p>
                <Button className="mt-4" onClick={function () { return router.push('/collaborators'); }}>
                  Find Collaborators
                </Button>
              </div>)}
          </div>
        </div>
        
        {/* Chat window - shown on mobile only when a chat is selected */}
        <div className={"w-full md:w-2/3 flex flex-col ".concat(showMobileChat ? 'block' : 'hidden md:block')}>
          {currentChatUserId && selectedMatch ? (<>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <Button variant="ghost" className="md:hidden mr-2 p-2" onClick={function () { return setShowMobileChat(false); }}>
                  <FiChevronLeft size={20}/>
                </Button>
                
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                  {selectedMatch.profiles.avatar_url ? (<img src={selectedMatch.profiles.avatar_url} alt={getOtherUserFullName(selectedMatch)} className="h-full w-full object-cover"/>) : (<FiUser className="text-primary-600" size={20}/>)}
                </div>
                
                <div className="ml-3 flex-1">
                  <p className="font-medium">{getOtherUserFullName(selectedMatch)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedMatch.profiles.institution || 'Researcher'}
                  </p>
                </div>
                
                <Button variant="ghost" className="p-2">
                  <FiMoreVertical size={20}/>
                </Button>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                {messagesList.length > 0 ? (<div>
                    {messagesList.map(function (message) { return (<ChatMessage key={message.id} message={message}/>); })}
                    <div ref={messagesEndRef}/>
                  </div>) : isLoading ? (<div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
                  </div>) : (<div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Say hello to start the conversation
                    </p>
                  </div>)}
              </div>
              
              {/* Message input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <Input placeholder="Type a message..." value={messageText} onChange={function (e) { return setMessageText(e.target.value); }} onKeyDown={handleKeyDown} className="flex-1"/>
                  <Button type="submit" className="ml-2" disabled={!messageText.trim() || isSending} isLoading={isSending}>
                    <FiSend size={18}/>
                  </Button>
                </div>
              </form>
            </>) : (<div className="flex-1 flex flex-col items-center justify-center">
              <FiEdit size={48} className="text-gray-300 dark:text-gray-600 mb-4"/>
              <h2 className="text-xl font-bold">Select a conversation</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Choose a chat from the list to start messaging
              </p>
            </div>)}
        </div>
      </div>
    </div>);
}
// Wrap in Suspense boundary to handle useSearchParams() hook
export default function ChatsPage() {
    return (<Suspense fallback={<div className="p-12 text-center">Loading chat interface...</div>}>
      <ChatPageContent />
    </Suspense>);
}
