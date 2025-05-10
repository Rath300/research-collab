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
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FiSend, FiUser, FiClock } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { getMessagesForMatch, sendMessage, setupMessageListener } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
export function ChatInterface(_a) {
    var _this = this;
    var matchId = _a.matchId, recipientId = _a.recipientId, recipientName = _a.recipientName, recipientAvatar = _a.recipientAvatar;
    var user = useAuthStore().user;
    var _b = useState([]), messages = _b[0], setMessages = _b[1];
    var _c = useState(''), messageText = _c[0], setMessageText = _c[1];
    var _d = useState(false), isLoading = _d[0], setIsLoading = _d[1];
    var _e = useState(false), isSending = _e[0], setIsSending = _e[1];
    var messagesEndRef = useRef(null);
    // Load initial messages
    useEffect(function () {
        var loadMessages = function () { return __awaiter(_this, void 0, void 0, function () {
            var data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!matchId || !user)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        setIsLoading(true);
                        return [4 /*yield*/, getMessagesForMatch(matchId)];
                    case 2:
                        data = _a.sent();
                        setMessages(data);
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error loading messages:', error_1);
                        return [3 /*break*/, 5];
                    case 4:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        loadMessages();
    }, [matchId, user]);
    // Set up real-time listener for new messages
    useEffect(function () {
        if (!matchId || !user)
            return;
        // Subscribe to new messages
        var unsubscribe = setupMessageListener(matchId, function (newMessage) {
            setMessages(function (prevMessages) {
                // Check if this message is already in the list to avoid duplicates
                var exists = prevMessages.some(function (msg) { return msg.id === newMessage.id; });
                if (exists)
                    return prevMessages;
                return __spreadArray(__spreadArray([], prevMessages, true), [newMessage], false);
            });
        });
        // Cleanup subscription on unmount
        return function () {
            unsubscribe();
        };
    }, [matchId, user]);
    // Scroll to bottom when messages change
    useEffect(function () {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    var handleSendMessage = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!messageText.trim() || !user || !matchId)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setIsSending(true);
                    return [4 /*yield*/, sendMessage({
                            match_id: matchId,
                            sender_id: user.id,
                            receiver_id: recipientId,
                            content: messageText.trim()
                        })];
                case 2:
                    _a.sent();
                    // Clear input field (note: the new message will come via the subscription)
                    setMessageText('');
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error sending message:', error_2);
                    return [3 /*break*/, 5];
                case 4:
                    setIsSending(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden mr-3">
          {recipientAvatar ? (<img src={recipientAvatar} alt={recipientName} className="h-full w-full object-cover"/>) : (<FiUser className="text-primary-600" size={20}/>)}
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {recipientName}
          </h3>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (<div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
          </div>) : messages.length === 0 ? (<div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>) : (messages.map(function (message) {
            var isCurrentUser = (user === null || user === void 0 ? void 0 : user.id) === message.sender_id;
            var timestamp = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
            return (<div key={message.id} className={"flex ".concat(isCurrentUser ? 'justify-end' : 'justify-start')}>
                <div className={"max-w-[75%] rounded-lg px-4 py-2 ".concat(isCurrentUser
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200')}>
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <div className={"flex items-center text-xs mt-1 ".concat(isCurrentUser ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400')}>
                    <FiClock size={10} className="mr-1"/>
                    <span>{timestamp}</span>
                  </div>
                </div>
              </div>);
        }))}
        <div ref={messagesEndRef}/>
      </div>
      
      {/* Message input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input placeholder="Type a message..." value={messageText} onChange={function (e) { return setMessageText(e.target.value); }} className="flex-1" disabled={isSending}/>
          
          <Button type="submit" disabled={!messageText.trim() || isSending} isLoading={isSending}>
            <FiSend size={18}/>
          </Button>
        </form>
      </div>
    </div>);
}
