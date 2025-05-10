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
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { FiUser, FiSave, FiUpload, FiAlertCircle } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { getProfile, updateProfile, uploadAvatar } from '@/lib/api';
export default function SettingsPage() {
    var _this = this;
    var router = useRouter();
    var _a = useAuthStore(), user = _a.user, profile = _a.profile, setProfile = _a.setProfile;
    var _b = useState({
        first_name: '',
        last_name: '',
        bio: '',
        institution: '',
        location: '',
        field_of_study: '',
        website: '',
        availability: 'full-time'
    }), formData = _b[0], setFormData = _b[1];
    var _c = useState(null), avatarFile = _c[0], setAvatarFile = _c[1];
    var _d = useState(null), avatarPreview = _d[0], setAvatarPreview = _d[1];
    var _e = useState(false), isLoading = _e[0], setIsLoading = _e[1];
    var _f = useState(false), isSaving = _f[0], setIsSaving = _f[1];
    var _g = useState(''), error = _g[0], setError = _g[1];
    var _h = useState(''), success = _h[0], setSuccess = _h[1];
    // Load profile data
    useEffect(function () {
        var loadProfile = function () { return __awaiter(_this, void 0, void 0, function () {
            var profileData, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!user) {
                            router.push('/login');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        setIsLoading(true);
                        if (!!profile) return [3 /*break*/, 3];
                        return [4 /*yield*/, getProfile(user.id)];
                    case 2:
                        profileData = _a.sent();
                        setProfile(profileData);
                        _a.label = 3;
                    case 3:
                        if (profile) {
                            setFormData({
                                first_name: profile.first_name || '',
                                last_name: profile.last_name || '',
                                bio: profile.bio || '',
                                institution: profile.institution || '',
                                location: profile.location || '',
                                field_of_study: profile.field_of_study || '',
                                website: profile.website || '',
                                availability: profile.availability || 'full-time'
                            });
                            if (profile.avatar_url) {
                                setAvatarPreview(profile.avatar_url);
                            }
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        err_1 = _a.sent();
                        console.error('Error loading profile:', err_1);
                        setError(err_1.message || 'Failed to load profile data');
                        return [3 /*break*/, 6];
                    case 5:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        loadProfile();
    }, [user, profile, setProfile, router]);
    var handleInputChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    var handleAvatarChange = function (e) {
        var _a;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        // Preview the image
        var reader = new FileReader();
        reader.onloadend = function () {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
        setAvatarFile(file);
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var avatarUrl, url, updatedProfile, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!user)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    setIsSaving(true);
                    setError('');
                    setSuccess('');
                    avatarUrl = profile === null || profile === void 0 ? void 0 : profile.avatar_url;
                    if (!avatarFile) return [3 /*break*/, 3];
                    return [4 /*yield*/, uploadAvatar(user.id, avatarFile)];
                case 2:
                    url = (_a.sent()).url;
                    avatarUrl = url;
                    _a.label = 3;
                case 3: return [4 /*yield*/, updateProfile(__assign(__assign({}, formData), { avatar_url: avatarUrl }))];
                case 4:
                    updatedProfile = _a.sent();
                    // Update global state
                    setProfile(updatedProfile);
                    // Show success message
                    setSuccess('Profile updated successfully');
                    return [3 /*break*/, 7];
                case 5:
                    err_2 = _a.sent();
                    console.error('Error updating profile:', err_2);
                    setError(err_2.message || 'Failed to update profile');
                    return [3 /*break*/, 7];
                case 6:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
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
    return (<div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden mb-4 relative">
                  {avatarPreview ? (<img src={avatarPreview} alt="Profile" className="h-full w-full object-cover"/>) : (<FiUser className="text-primary-600" size={36}/>)}
                </div>
                
                <p className="font-medium text-lg">{profile === null || profile === void 0 ? void 0 : profile.first_name} {profile === null || profile === void 0 ? void 0 : profile.last_name}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{user === null || user === void 0 ? void 0 : user.email}</p>
                
                <div className="mt-4 w-full">
                  <label className="block w-full">
                    <span className="sr-only">Choose profile photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange}/>
                    <Button type="button" variant="outline" className="w-full" onClick={function () { var _a; return (_a = document.querySelector('input[type="file"]')) === null || _a === void 0 ? void 0 : _a.click(); }}>
                      <FiUpload className="mr-2" size={16}/>
                      Change Photo
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and public profile
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (<div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center space-x-2 text-sm dark:bg-red-900/20 dark:text-red-400">
                    <FiAlertCircle className="h-5 w-5 flex-shrink-0"/>
                    <span>{error}</span>
                  </div>)}
                
                {success && (<div className="bg-green-50 text-green-600 p-3 rounded-md text-sm dark:bg-green-900/20 dark:text-green-400">
                    {success}
                  </div>)}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleInputChange} required/>
                  
                  <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleInputChange} required/>
                </div>
                
                <Input label="Bio" name="bio" value={formData.bio || ''} onChange={handleInputChange} type="textarea" rows={4} placeholder="Write a short bio about yourself..."/>
                
                <Input label="Institution" name="institution" value={formData.institution || ''} onChange={handleInputChange} placeholder="e.g., Stanford University"/>
                
                <Input label="Location" name="location" value={formData.location || ''} onChange={handleInputChange} placeholder="e.g., San Francisco, CA"/>
                
                <Input label="Field of Study" name="field_of_study" value={formData.field_of_study || ''} onChange={handleInputChange} placeholder="e.g., Computer Science"/>
                
                <Input label="Website" name="website" value={formData.website || ''} onChange={handleInputChange} placeholder="e.g., https://yourwebsite.com"/>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Availability
                  </label>
                  <select name="availability" value={formData.availability || 'full-time'} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="not-available">Not Available</option>
                  </select>
                </div>
                
                <div className="pt-4">
                  <Button type="submit" isLoading={isSaving}>
                    <FiSave className="mr-2" size={16}/>
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
}
