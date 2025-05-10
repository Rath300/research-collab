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
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FiBell, FiX, FiMessageSquare, FiUsers, FiInfo } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { getNotifications, markNotificationAsRead, setupNotificationsListener } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
export function NotificationCenter() {
    var _this = this;
    var router = useRouter();
    var user = useAuthStore().user;
    var _a = useState([]), notifications = _a[0], setNotifications = _a[1];
    var _b = useState(0), unreadCount = _b[0], setUnreadCount = _b[1];
    var _c = useState(false), isOpen = _c[0], setIsOpen = _c[1];
    var _d = useState(false), isLoading = _d[0], setIsLoading = _d[1];
    // Load initial notifications
    useEffect(function () {
        var loadNotifications = function () { return __awaiter(_this, void 0, void 0, function () {
            var data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!user)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        setIsLoading(true);
                        return [4 /*yield*/, getNotifications(user.id)];
                    case 2:
                        data = _a.sent();
                        setNotifications(data);
                        setUnreadCount(data.filter(function (n) { return !n.is_read; }).length);
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error loading notifications:', error_1);
                        return [3 /*break*/, 5];
                    case 4:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        loadNotifications();
    }, [user]);
    // Set up real-time listener for new notifications
    useEffect(function () {
        if (!user)
            return;
        // Subscribe to new notifications
        var unsubscribe = setupNotificationsListener(user.id, function (newNotification) {
            setNotifications(function (prev) {
                // Check if this notification is already in the list to avoid duplicates
                var exists = prev.some(function (n) { return n.id === newNotification.id; });
                if (exists)
                    return prev;
                // Add new notification at the beginning of the array
                return __spreadArray([newNotification], prev, true);
            });
            // Increment unread count
            if (!newNotification.is_read) {
                setUnreadCount(function (prev) { return prev + 1; });
            }
        });
        // Cleanup subscription on unmount
        return function () {
            unsubscribe();
        };
    }, [user]);
    var handleNotificationClick = function (notification) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!notification.is_read) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // Mark as read in the database
                    return [4 /*yield*/, markNotificationAsRead(notification.id)];
                case 2:
                    // Mark as read in the database
                    _a.sent();
                    // Update local state
                    setNotifications(notifications.map(function (n) {
                        return n.id === notification.id ? __assign(__assign({}, n), { is_read: true }) : n;
                    }));
                    // Update unread count
                    setUnreadCount(function (prev) { return Math.max(0, prev - 1); });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error marking notification as read:', error_2);
                    return [3 /*break*/, 4];
                case 4:
                    // Navigate if there's a link
                    if (notification.link) {
                        router.push(notification.link);
                        setIsOpen(false);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var handleMarkAllAsRead = function () { return __awaiter(_this, void 0, void 0, function () {
        var unreadIds, _i, unreadIds_1, id, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user || notifications.length === 0)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    unreadIds = notifications.filter(function (n) { return !n.is_read; }).map(function (n) { return n.id; });
                    _i = 0, unreadIds_1 = unreadIds;
                    _a.label = 2;
                case 2:
                    if (!(_i < unreadIds_1.length)) return [3 /*break*/, 5];
                    id = unreadIds_1[_i];
                    return [4 /*yield*/, markNotificationAsRead(id)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    // Update local state
                    setNotifications(notifications.map(function (n) { return (__assign(__assign({}, n), { is_read: true })); }));
                    setUnreadCount(0);
                    return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    console.error('Error marking all notifications as read:', error_3);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var getNotificationIcon = function (type) {
        switch (type) {
            case 'message':
                return <FiMessageSquare className="text-blue-500" size={20}/>;
            case 'match':
                return <FiUsers className="text-green-500" size={20}/>;
            default:
                return <FiInfo className="text-primary-500" size={20}/>;
        }
    };
    return (<div className="relative">
      {/* Notification Bell */}
      <Button variant="ghost" className="relative p-2" onClick={function () { return setIsOpen(!isOpen); }} aria-label="Notifications">
        <FiBell size={20}/>
        {unreadCount > 0 && (<span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>)}
      </Button>
      
      {/* Notification Panel */}
      {isOpen && (<div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium">Notifications</h3>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (<Button variant="ghost" size="sm" className="text-sm" onClick={handleMarkAllAsRead}>
                  Mark all as read
                </Button>)}
              
              <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={function () { return setIsOpen(false); }} aria-label="Close">
                <FiX size={18}/>
              </Button>
            </div>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (<div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
              </div>) : notifications.length === 0 ? (<div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <p>No notifications</p>
              </div>) : (<div>
                {notifications.map(function (notification) { return (<div key={notification.id} className={"p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ".concat(!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : '')} onClick={function () { return handleNotificationClick(notification); }}>
                    <div className="flex">
                      <div className="flex-shrink-0 mr-3">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={"text-sm font-medium ".concat(!notification.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>
                          {notification.title}
                        </p>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notification.body}
                        </p>
                        
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      
                      {!notification.is_read && (<div className="ml-2">
                          <div className="h-2 w-2 bg-blue-500 rounded-full"/>
                        </div>)}
                    </div>
                  </div>); })}
              </div>)}
          </div>
        </div>)}
    </div>);
}
