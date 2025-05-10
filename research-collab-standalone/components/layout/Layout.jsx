"use client";
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
import React, { useEffect } from 'react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { usePathname } from 'next/navigation';
import { getUser } from '@/lib/supabase';
import { profiles } from '@/lib/api';
export function Layout(_a) {
    var _this = this;
    var children = _a.children;
    var pathname = usePathname();
    var _b = useAuthStore(), user = _b.user, setUser = _b.setUser, setProfile = _b.setProfile, isLoading = _b.isLoading, setLoading = _b.setLoading;
    var _c = useUIStore(), sidebarOpen = _c.sidebarOpen, setSidebarOpen = _c.setSidebarOpen, darkMode = _c.darkMode;
    var isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/reset-password';
    var isLandingPage = pathname === '/';
    useEffect(function () {
        var initializeAuth = function () { return __awaiter(_this, void 0, void 0, function () {
            var currentUser, userProfile, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, 5, 6]);
                        setLoading(true);
                        return [4 /*yield*/, getUser()];
                    case 1:
                        currentUser = _a.sent();
                        if (!currentUser) return [3 /*break*/, 3];
                        setUser(currentUser);
                        return [4 /*yield*/, profiles.getById(currentUser.id)];
                    case 2:
                        userProfile = _a.sent();
                        setProfile(userProfile);
                        _a.label = 3;
                    case 3: return [3 /*break*/, 6];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Error loading user:', error_1);
                        return [3 /*break*/, 6];
                    case 5:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        initializeAuth();
    }, [setUser, setProfile, setLoading]);
    // Close sidebar on route change for mobile
    useEffect(function () {
        setSidebarOpen(false);
    }, [pathname, setSidebarOpen]);
    // Apply dark mode class to body
    useEffect(function () {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);
    // For auth pages and landing page we use a different layout
    if (isAuthPage || isLandingPage) {
        return <>{children}</>;
    }
    return (<div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
      <Sidebar />
      
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {isLoading ? (<div className="flex h-full w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
            </div>) : (children)}
        </main>
      </div>
    </div>);
}
