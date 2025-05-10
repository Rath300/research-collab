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
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore, useUIStore } from '@/lib/store';
import { signOut } from '@/lib/supabase';
import { FiMenu, FiX, FiSun, FiMoon, FiUser, FiLogOut, FiSettings, FiBell } from 'react-icons/fi';
export function Navbar() {
    var _this = this;
    var _a = useAuthStore(), user = _a.user, profile = _a.profile, logOut = _a.signOut;
    var _b = useUIStore(), sidebarOpen = _b.sidebarOpen, toggleSidebar = _b.toggleSidebar, darkMode = _b.darkMode, toggleDarkMode = _b.toggleDarkMode;
    var _c = useState(false), dropdownOpen = _c[0], setDropdownOpen = _c[1];
    var handleSignOut = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, signOut()];
                case 1:
                    _a.sent();
                    logOut();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error signing out:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="mr-4 p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Toggle sidebar">
            {sidebarOpen ? <FiX size={20}/> : <FiMenu size={20}/>}
          </button>
          
          <Link href="/dashboard" className="font-bold text-lg text-primary-600 dark:text-primary-400">
            ResearchCollab
          </Link>
        </div>
        
        {/* Right side */}
        <div className="flex items-center space-x-4">
          <button onClick={toggleDarkMode} className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Toggle dark mode">
            {darkMode ? <FiSun size={20}/> : <FiMoon size={20}/>}
          </button>
          
          <button className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 relative" aria-label="Notifications">
            <FiBell size={20}/>
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          {profile && (<div className="relative">
              <button onClick={function () { return setDropdownOpen(!dropdownOpen); }} className="flex items-center space-x-2 focus:outline-none" aria-expanded={dropdownOpen} aria-haspopup="true">
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (<img src={profile.avatar_url} alt={"".concat(profile.first_name, " ").concat(profile.last_name)} className="h-full w-full object-cover"/>) : (<FiUser className="text-primary-600 dark:text-primary-400" size={16}/>)}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {profile.first_name}
                </span>
              </button>
              
              {dropdownOpen && (<div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-50" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                  <div className="py-1" role="none">
                    <Link href={"/profile/".concat(user === null || user === void 0 ? void 0 : user.id)} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem" onClick={function () { return setDropdownOpen(false); }}>
                      <FiUser className="mr-2" size={16}/>
                      Your Profile
                    </Link>
                    
                    <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem" onClick={function () { return setDropdownOpen(false); }}>
                      <FiSettings className="mr-2" size={16}/>
                      Settings
                    </Link>
                    
                    <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem" onClick={function () {
                    setDropdownOpen(false);
                    handleSignOut();
                }}>
                      <FiLogOut className="mr-2" size={16}/>
                      Sign out
                    </button>
                  </div>
                </div>)}
            </div>)}
        </div>
      </div>
    </nav>);
}
