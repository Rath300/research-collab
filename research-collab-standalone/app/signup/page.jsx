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
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { signUp } from '@/lib/supabase';
// Content component that uses useSearchParams
function SignupContent() {
    var _this = this;
    var router = useRouter();
    var searchParams = useSearchParams();
    var redirectTo = (searchParams === null || searchParams === void 0 ? void 0 : searchParams.get('redirectTo')) || '/dashboard';
    var setUser = useAuthStore().setUser;
    var _a = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    }), formData = _a[0], setFormData = _a[1];
    var _b = useState(''), error = _b[0], setError = _b[1];
    var _c = useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var handleChange = function (e) {
        var _a;
        setFormData(__assign(__assign({}, formData), (_a = {}, _a[e.target.name] = e.target.value, _a)));
    };
    var validateForm = function () {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all fields');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var metadata, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!validateForm()) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setIsLoading(true);
                    setError('');
                    metadata = {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                    };
                    return [4 /*yield*/, signUp(formData.email, formData.password, metadata)];
                case 2:
                    data = _a.sent();
                    if (data.user) {
                        setUser(data.user);
                        // Show success message and redirect to onboarding or the requested page
                        setIsLoading(false);
                        // Store the redirectTo in localStorage to use after login
                        if (redirectTo !== '/dashboard') {
                            localStorage.setItem('redirectTo', redirectTo);
                        }
                        // Always go to onboarding first after signup
                        router.push('/onboarding');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('Signup error:', err_1);
                    setError(err_1.message || 'Failed to create account. Please try again.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 py-8">
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
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Join ResearchCollab to connect with fellow researchers and collaborate on projects
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (<div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center space-x-2 text-sm dark:bg-red-900/20 dark:text-red-400">
                  <FiAlertCircle className="h-5 w-5 flex-shrink-0"/>
                  <span>{error}</span>
                </div>)}
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" name="firstName" placeholder="Jane" value={formData.firstName} onChange={handleChange} leftIcon={<FiUser />} required autoComplete="given-name"/>
                
                <Input label="Last Name" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} leftIcon={<FiUser />} required autoComplete="family-name"/>
              </div>
              
              <Input label="Email" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} leftIcon={<FiMail />} required autoComplete="email"/>
              
              <Input label="Password" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} leftIcon={<FiLock />} required autoComplete="new-password" helperText="Must be at least 6 characters long"/>
              
              <Input label="Confirm Password" type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} leftIcon={<FiLock />} required autoComplete="new-password"/>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" isLoading={isLoading} isFullWidth>
                Sign up
              </Button>
              
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link href={redirectTo !== '/dashboard' ? "/login?redirectTo=".concat(encodeURIComponent(redirectTo)) : '/login'} className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                  Log in
                </Link>
              </p>
              
              <p className="text-center text-xs text-gray-500 dark:text-gray-500">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-primary-600 dark:hover:text-primary-400">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-primary-600 dark:hover:text-primary-400">
                  Privacy Policy
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>);
}
// Wrap component in Suspense
export default function SignupPage() {
    return (<Suspense fallback={<div className="p-12 text-center">Loading signup form...</div>}>
      <SignupContent />
    </Suspense>);
}
