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
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { updatePassword, getBrowserClient } from '@/lib/supabase';
export default function UpdatePasswordPage() {
    var _this = this;
    var router = useRouter();
    var _a = useState(''), password = _a[0], setPassword = _a[1];
    var _b = useState(''), confirmPassword = _b[0], setConfirmPassword = _b[1];
    var _c = useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var _d = useState(false), isSuccess = _d[0], setIsSuccess = _d[1];
    var _e = useState(''), error = _e[0], setError = _e[1];
    // Check if user is authenticated via reset token
    useEffect(function () {
        var checkSession = function () { return __awaiter(_this, void 0, void 0, function () {
            var supabase, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase.auth.getSession()];
                    case 1:
                        data = (_a.sent()).data;
                        // If no session and no access token in URL, redirect to login
                        if (!data.session && !window.location.hash.includes('access_token')) {
                            router.push('/login');
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        checkSession();
    }, [router]);
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    // Validate passwords
                    if (!password || !confirmPassword) {
                        setError('Please fill in all fields');
                        return [2 /*return*/];
                    }
                    if (password !== confirmPassword) {
                        setError('Passwords do not match');
                        return [2 /*return*/];
                    }
                    if (password.length < 8) {
                        setError('Password must be at least 8 characters');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setIsLoading(true);
                    setError('');
                    // Update password
                    return [4 /*yield*/, updatePassword(password)];
                case 2:
                    // Update password
                    _a.sent();
                    // Show success message
                    setIsSuccess(true);
                    // Redirect to login after 3 seconds
                    setTimeout(function () {
                        router.push('/login');
                    }, 3000);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('Update password error:', err_1);
                    setError(err_1.message || 'Failed to update password. Please try again.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-lg font-bold text-white">#</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">ResearchCollab</span>
            </div>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Update your password</CardTitle>
            <CardDescription>
              Create a new password for your account
            </CardDescription>
          </CardHeader>
          
          {isSuccess ? (<CardContent className="pt-4 pb-6">
              <div className="bg-green-50 text-green-600 p-4 rounded-md flex items-center space-x-3 text-sm dark:bg-green-900/20 dark:text-green-400">
                <FiCheckCircle className="h-5 w-5 flex-shrink-0"/>
                <div>
                  <p className="font-medium">Password updated successfully!</p>
                  <p className="mt-1">You&apos;ll be redirected to the login page shortly.</p>
                </div>
              </div>
            </CardContent>) : (<form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (<div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center space-x-2 text-sm dark:bg-red-900/20 dark:text-red-400">
                    <FiAlertCircle className="h-5 w-5 flex-shrink-0"/>
                    <span>{error}</span>
                  </div>)}
                
                <Input label="New Password" type="password" placeholder="••••••••" value={password} onChange={function (e) { return setPassword(e.target.value); }} leftIcon={<FiLock />} required/>
                
                <Input label="Confirm Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={function (e) { return setConfirmPassword(e.target.value); }} leftIcon={<FiLock />} required/>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" isLoading={isLoading} isFullWidth>
                  Update Password
                </Button>
              </CardFooter>
            </form>)}
        </Card>
      </div>
    </div>);
}
