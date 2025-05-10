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
import { getBrowserClient, SupabaseError } from './supabaseClient';
import { profileSchema, researchPostSchema, matchSchema, messageSchema, profileUpdateSchema } from './schema';
import { generateContentHash } from './utils';
/**
 * Base API client that handles data validation and error handling
 */
var ApiClient = /** @class */ (function () {
    function ApiClient(schema, tableName) {
        this.schema = schema;
        this.tableName = tableName;
    }
    /**
     * Validate data against the schema
     */
    ApiClient.prototype.validate = function (data) {
        try {
            return this.schema.parse(data);
        }
        catch (error) {
            // Check if the error has the expected structure of a ZodError
            if (error &&
                typeof error === 'object' &&
                'errors' in error &&
                Array.isArray(error.errors)) {
                var zodError = error;
                var errorMessage = zodError.errors.map(function (e) { return e.message; }).join(', ');
                throw new SupabaseError("Validation error: ".concat(errorMessage), 400);
            }
            throw new SupabaseError('Unknown validation error', 400);
        }
    };
    /**
     * Get all records with optional filters
     */
    ApiClient.prototype.getAll = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        supabase = getBrowserClient();
                        query = supabase
                            .from(this.tableName)
                            .select('*');
                        // Apply options
                        if (options === null || options === void 0 ? void 0 : options.limit) {
                            query = query.limit(options.limit);
                        }
                        if (options === null || options === void 0 ? void 0 : options.offset) {
                            query = query.range(options.offset, (options.offset + (options.limit || 10) - 1));
                        }
                        if (options === null || options === void 0 ? void 0 : options.order) {
                            query = query.order(options.order.column, { ascending: options.order.ascending });
                        }
                        if (options === null || options === void 0 ? void 0 : options.filter) {
                            Object.entries(options.filter).forEach(function (_a) {
                                var key = _a[0], value = _a[1];
                                if (value !== undefined) {
                                    query = query.eq(key, value);
                                }
                            });
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new SupabaseError("Error fetching ".concat(this.tableName, ": ").concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     * Get a single record by ID
     */
    ApiClient.prototype.getById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase
                                .from(this.tableName)
                                .select('*')
                                .eq('id', id)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            if (error.code === 'PGRST116') {
                                return [2 /*return*/, null]; // Not found
                            }
                            throw new SupabaseError("Error fetching ".concat(this.tableName, ": ").concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     * Create a new record
     */
    ApiClient.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedData, supabase, _a, createdData, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        validatedData = this.validate(data);
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase
                                .from(this.tableName)
                                .insert(validatedData)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), createdData = _a.data, error = _a.error;
                        if (error) {
                            throw new SupabaseError("Error creating ".concat(this.tableName, ": ").concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, createdData];
                }
            });
        });
    };
    /**
     * Update an existing record
     */
    ApiClient.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedData, supabase, _a, updatedData, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        validatedData = this.validate(data);
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase
                                .from(this.tableName)
                                .update(__assign(__assign({}, validatedData), { updated_at: new Date().toISOString() }))
                                .eq('id', id)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), updatedData = _a.data, error = _a.error;
                        if (error) {
                            throw new SupabaseError("Error updating ".concat(this.tableName, ": ").concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, updatedData];
                }
            });
        });
    };
    /**
     * Delete a record
     */
    ApiClient.prototype.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase
                                .from(this.tableName)
                                .delete()
                                .eq('id', id)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new SupabaseError("Error deleting ".concat(this.tableName, ": ").concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return ApiClient;
}());
// Create API clients for each entity
export var profilesApi = new ApiClient(profileUpdateSchema, 'profiles');
export var postsApi = new ApiClient(researchPostSchema, 'research_posts');
export var matchesApi = new ApiClient(matchSchema, 'matches');
export var messagesApi = new ApiClient(messageSchema, 'messages');
// Specialized API methods for profiles
export var profiles = __assign(__assign({}, profilesApi), { 
    /**
     * Get a profile by id
     */
    getById: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, profilesApi.getById(id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }, 
    /**
     * Get the current user's profile
     */
    getCurrentUserProfile: function () {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, user, authError, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        supabase = getBrowserClient();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, supabase.auth.getUser()];
                    case 2:
                        _a = _b.sent(), user = _a.data.user, authError = _a.error;
                        if (authError || !user) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, profilesApi.getById(user.id)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        error_1 = _b.sent();
                        console.error('Error getting current user profile:', error_1);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }, 
    /**
     * Search profiles by name or interests
     */
    search: function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, limit) {
            var supabase, _a, data, error;
            if (limit === void 0) { limit = 10; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase
                                .from('profiles')
                                .select('*')
                                .or("first_name.ilike.%".concat(query, "%,last_name.ilike.%").concat(query, "%,institution.ilike.%").concat(query, "%"))
                                .limit(limit)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new SupabaseError("Error searching profiles: ".concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    },
    /**
     * Get profile statistics
     */
    getStats: function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, postsCount, postsError, _b, matchesCount, matchesError, _c, messagesCount, messagesError;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase
                                .from('research_posts')
                                .select('id', { count: 'exact', head: true })
                                .eq('user_id', userId)];
                    case 1:
                        _a = _d.sent(), postsCount = _a.count, postsError = _a.error;
                        return [4 /*yield*/, supabase
                                .from('matches')
                                .select('id', { count: 'exact', head: true })
                                .or("user_id_1.eq.".concat(userId, ",user_id_2.eq.").concat(userId))
                                .eq('status', 'matched')];
                    case 2:
                        _b = _d.sent(), matchesCount = _b.count, matchesError = _b.error;
                        return [4 /*yield*/, supabase
                                .from('messages')
                                .select('id', { count: 'exact', head: true })
                                .eq('sender_id', userId)];
                    case 3:
                        _c = _d.sent(), messagesCount = _c.count, messagesError = _c.error;
                        if (postsError || matchesError || messagesError) {
                            throw new SupabaseError("Error fetching profile stats", 500);
                        }
                        return [2 /*return*/, {
                                postCount: postsCount || 0,
                                matchCount: matchesCount || 0,
                                messageCount: messagesCount || 0,
                                viewCount: 0 // Default for now, could fetch from profile_views table if implemented
                            }];
                }
            });
        });
    },
    /**
     * Get matches for a user
     */
    getMatches: function (userId, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        supabase = getBrowserClient();
                        query = supabase
                                .from('matches')
                                .select("\n                *,\n                user1:user_id_1(id, first_name, last_name, avatar_url, title, institution),\n                user2:user_id_2(id, first_name, last_name, avatar_url, title, institution)\n            ")
                                .or("user_id_1.eq.".concat(userId, ",user_id_2.eq.").concat(userId))
                                .eq('status', 'matched');
                        if (options.limit) {
                            query = query.limit(options.limit);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new SupabaseError("Error fetching matches: ".concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, data || []];
                }
            });
        });
    },
    /**
     * Create or update a profile
     * This handles the case where a profile doesn't exist yet
     */
    createOrUpdateProfile: function (userId, profileData) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, existingProfile, error_new, validatedData, _a, data, error, _b, createdData, createError;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase
                                .from('profiles')
                                .select('*')
                                .eq('id', userId)];
                    case 1:
                        existingProfile = _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_new = _c.sent();
                        console.error('Error checking existing profile:', error_new);
                        return [3 /*break*/, 3];
                    case 3:
                        validatedData = profileUpdateSchema.parse(__assign(__assign({}, profileData), { 
                            // Ensure these fields are set
                            id: userId, 
                            updated_at: new Date().toISOString() 
                        }));
                        // If profile already exists, update it
                        if (existingProfile && existingProfile.data && existingProfile.data.length > 0) {
                            return [2 /*return*/, this.update(userId, validatedData)];
                        }
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 10]);
                        return [4 /*yield*/, supabase
                                .from('profiles')
                                .update(validatedData)
                                .eq('id', userId)
                                .select()
                                .single()];
                    case 5:
                        _a = _c.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 6:
                        _c.trys.push([6, 8, , 9]);
                        console.log('Update failed, trying to insert a new profile');
                        return [4 /*yield*/, supabase
                                .from('profiles')
                                .insert(__assign(__assign({}, validatedData), { id: userId }))
                                .select()
                                .single()];
                    case 7:
                        _b = _c.sent(), createdData = _b.data, createError = _b.error;
                        if (createError) {
                            throw new SupabaseError("Error creating profile: ".concat(createError.message), 500, createError.code);
                        }
                        return [2 /*return*/, createdData];
                    case 8:
                        _c.sent();
                        throw new SupabaseError("Failed to create or update profile. Please ensure your Supabase database has the correct structure.", 500);
                    case 9: return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    }
});
// Specialized API methods for research posts
export var posts = __assign(__assign({}, postsApi), { 
    /**
     * Get a single research post by id
     */
    getResearchPost: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, postsApi.getById(id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }, 
    /**
     * Update a research post
     */
    updateResearchPost: function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, postsApi.update(id, data)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }, 
    /**
     * Delete a research post
     */
    deleteResearchPost: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, postsApi.delete(id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    },
    /**
     * Get research posts with options
     */
    getResearchPosts: function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, limit, offset, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        supabase = getBrowserClient();
                        query = supabase
                            .from('research_posts')
                            .select('*, profiles:user_id(first_name, last_name, avatar_url, title)');
                            
                        limit = options.limit || 10;
                        offset = options.offset || 0;
                        
                        if (options.userId) {
                            query = query.eq('user_id', options.userId);
                        }
                        
                        if (options.visibility) {
                            query = query.eq('visibility', options.visibility);
                        } else {
                            query = query.eq('visibility', 'public');
                        }
                        
                        query = query.order('created_at', { ascending: false })
                            .range(offset, offset + limit - 1);
                            
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new SupabaseError("Error fetching research posts: ".concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, data || []];
                }
            });
        });
    },
    /**
     * Get posts by user id
     */
    getByUserId: function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, limit) {
            var supabase, _a, data, error;
            if (limit === void 0) { limit = 10; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase
                                .from('research_posts')
                                .select('*, profiles:user_id(first_name, last_name, avatar_url, title)')
                                .eq('user_id', userId)
                                .order('created_at', { ascending: false })
                                .limit(limit)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new SupabaseError("Error fetching user posts: ".concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    }, 
    /**
     * Get posts for the feed with user data
     */
    getFeed: function () {
        return __awaiter(this, arguments, void 0, function (limit, offset) {
            var supabase, _a, data, error;
            if (limit === void 0) { limit = 10; }
            if (offset === void 0) { offset = 0; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase
                                .from('research_posts')
                                .select('*, profiles:user_id(first_name, last_name, avatar_url, title)')
                                .eq('visibility', 'public')
                                .order('created_at', { ascending: false })
                                .range(offset, offset + limit - 1)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new SupabaseError("Error fetching research posts: ".concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    }, 
    /**
     * Increment engagement count for a post
     */
    incrementEngagement: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, post, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, postsApi.getById(id)];
                    case 1:
                        post = _a.sent();
                        if (!post) {
                            throw new SupabaseError('Post not found', 404);
                        }
                        return [4 /*yield*/, supabase
                                .from('research_posts')
                                .update({
                                engagement_count: (post.engagement_count || 0) + 1,
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', id)];
                    case 2:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new SupabaseError("Error updating post engagement: ".concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/];
                }
            });
        });
    } });
// Specialized API methods for matches
export var matches = __assign(__assign({}, matchesApi), { 
    /**
     * Check if two users are already matched
     */
    checkIfMatched: function (user1Id, user2Id) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase
                                .from('matches')
                                .select('id, status')
                                .or("and(user_id_1.eq.".concat(user1Id, ",user_id_2.eq.").concat(user2Id, "),and(user_id_1.eq.").concat(user2Id, ",user_id_2.eq.").concat(user1Id, ")"))
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116') {
                            throw new SupabaseError("Error checking match status: ".concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, {
                                isMatched: !!data && data.status === 'matched'
                            }];
                }
            });
        });
    }, 
    /**
     * Get potential matches (profiles not yet matched with)
     */
    getPotentialMatches: function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, limit) {
            var supabase, _a, existingMatches, matchError, excludeIds, _b, profiles, profileError;
            if (limit === void 0) { limit = 10; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase
                                .from('matches')
                                .select('user_id_1, user_id_2')
                                .or("user_id_1.eq.".concat(userId, ",user_id_2.eq.").concat(userId))];
                    case 1:
                        _a = _c.sent(), existingMatches = _a.data, matchError = _a.error;
                        if (matchError) {
                            throw new SupabaseError("Error fetching existing matches: ".concat(matchError.message), 500, matchError.code);
                        }
                        excludeIds = new Set([userId]);
                        existingMatches === null || existingMatches === void 0 ? void 0 : existingMatches.forEach(function (match) {
                            excludeIds.add(match.user_id_1);
                            excludeIds.add(match.user_id_2);
                        });
                        return [4 /*yield*/, supabase
                                .from('profiles')
                                .select('*')
                                .not('id', 'in', "(".concat(Array.from(excludeIds).join(','), ")"))
                                .limit(limit)];
                    case 2:
                        _b = _c.sent(), profiles = _b.data, profileError = _b.error;
                        if (profileError) {
                            throw new SupabaseError("Error fetching potential matches: ".concat(profileError.message), 500, profileError.code);
                        }
                        return [2 /*return*/, profiles];
                }
            });
        });
    }, 
    /**
     * Get all confirmed matches with profile data
     */
    getConfirmedMatches: function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase
                                .from('matches')
                                .select("\n        *,\n        user1:user_id_1(id, first_name, last_name, avatar_url, title, institution),\n        user2:user_id_2(id, first_name, last_name, avatar_url, title, institution)\n      ")
                                .or("user_id_1.eq.".concat(userId, ",user_id_2.eq.").concat(userId))
                                .eq('status', 'matched')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new SupabaseError("Error fetching matches: ".concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    } });
// Specialized API methods for messages
export var messages = __assign(__assign({}, messagesApi), { 
    /**
     * Get messages for a match with sender/receiver data
     */
    getMessagesForMatch: function (matchId_1) {
        return __awaiter(this, arguments, void 0, function (matchId, limit) {
            var supabase, _a, data, error;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase
                                .from('messages')
                                .select('*, sender:sender_id(first_name, last_name, avatar_url), receiver:receiver_id(first_name, last_name, avatar_url)')
                                .eq('match_id', matchId)
                                .order('created_at', { ascending: false })
                                .limit(limit)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new SupabaseError("Error fetching messages: ".concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    }, 
    /**
     * Mark messages as read
     */
    markAsRead: function (matchId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase
                                .from('messages')
                                .update({ is_read: true })
                                .eq('match_id', matchId)
                                .eq('receiver_id', userId)
                                .eq('is_read', false)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new SupabaseError("Error marking messages as read: ".concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }, 
    /**
     * Set up real-time message subscription
     */
    setupMessageListener: function (matchId, callback) {
        var supabase = getBrowserClient();
        var subscription = supabase
            .channel("match-".concat(matchId, "-messages"))
            .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: "match_id=eq.".concat(matchId)
        }, function (payload) {
            callback(payload.new);
        })
            .subscribe();
        // Return cleanup function
        return function () {
            supabase.removeChannel(subscription);
        };
    } });
// Timestamped proofs API for research verification
export var proofs = {
    /**
     * Create a proof of research submission with timestamp
     */
    createProof: function (userId, projectId, content) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, contentHash, proof, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        supabase = getBrowserClient();
                        contentHash = generateContentHash(content);
                        proof = {
                            user_id: userId,
                            project_id: projectId,
                            content_hash: contentHash,
                            timestamp: new Date().toISOString(),
                        };
                        return [4 /*yield*/, supabase
                                .from('proofs')
                                .insert(proof)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new SupabaseError("Error creating proof: ".concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    },
    /**
     * Get all proofs for a project
     */
    getProofsByProject: function (projectId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase
                                .from('proofs')
                                .select("\n        *,\n        profiles:user_id (\n          id,\n          first_name,\n          last_name\n        )\n      ")
                                .eq('project_id', projectId)
                                .order('created_at', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new SupabaseError("Error fetching proofs: ".concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, data || []];
                }
            });
        });
    }
};
// Supabase storage utility functions
export var storage = {
    /**
     * Upload a file to Supabase storage
     */
    uploadFile: function (bucket, path, file) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase.storage
                                .from(bucket)
                                .upload(path, file, {
                                cacheControl: '3600',
                                upsert: false,
                            })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new SupabaseError("Error uploading file: ".concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    },
    /**
     * Get a public URL for a file
     */
    getFileUrl: function (bucket, path) {
        var supabase = getBrowserClient();
        var data = supabase.storage.from(bucket).getPublicUrl(path).data;
        return data.publicUrl;
    },
    /**
     * Delete a file from storage
     */
    deleteFile: function (bucket, path) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        supabase = getBrowserClient();
                        return [4 /*yield*/, supabase.storage
                                .from(bucket)
                                .remove([path])];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new SupabaseError("Error deleting file: ".concat(error.message), 500, error.code);
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    }
};
// Notification functions
export var getNotifications = function (userId_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([userId_1], args_1, true), void 0, function (userId, limit) {
        var supabase, _a, data, error;
        if (limit === void 0) { limit = 20; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    supabase = getBrowserClient();
                    return [4 /*yield*/, supabase
                            .from('notifications')
                            .select('*')
                            .eq('user_id', userId)
                            .order('created_at', { ascending: false })
                            .limit(limit)];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        throw new SupabaseError("Error fetching notifications: ".concat(error.message), 500, error.code);
                    }
                    return [2 /*return*/, data];
            }
        });
    });
};
export var markNotificationAsRead = function (notificationId) { return __awaiter(void 0, void 0, void 0, function () {
    var supabase, error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                supabase = getBrowserClient();
                return [4 /*yield*/, supabase
                        .from('notifications')
                        .update({ is_read: true })
                        .eq('id', notificationId)];
            case 1:
                error = (_a.sent()).error;
                if (error) {
                    throw new SupabaseError("Error marking notification as read: ".concat(error.message), 500, error.code);
                }
                return [2 /*return*/];
        }
    });
}); };
export var setupNotificationsListener = function (userId, callback) {
    var supabase = getBrowserClient();
    // Subscribe to all new notifications for this user
    var subscription = supabase
        .channel("notifications:".concat(userId))
        .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: "user_id=eq.".concat(userId)
    }, function (payload) {
        // Call the callback with the new notification data
        callback(payload.new);
    })
        .subscribe();
    // Return a function to unsubscribe
    return function () {
        supabase.removeChannel(subscription);
    };
};
// Export standalone functions for chat functionality
export var getConfirmedMatches = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var supabase, _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                supabase = getBrowserClient();
                return [4 /*yield*/, supabase
                        .from('matches')
                        .select("\n      *,\n      user1:user_id_1(id, first_name, last_name, avatar_url, title, institution),\n      user2:user_id_2(id, first_name, last_name, avatar_url, title, institution)\n    ")
                        .or("user_id_1.eq.".concat(userId, ",user_id_2.eq.").concat(userId))
                        .eq('status', 'matched')];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    throw new SupabaseError("Error fetching matches: ".concat(error.message), 500, error.code);
                }
                return [2 /*return*/, data];
        }
    });
}); };
export var getMessagesForMatch = function (matchId_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([matchId_1], args_1, true), void 0, function (matchId, limit) {
        var supabase, _a, data, error;
        if (limit === void 0) { limit = 50; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    supabase = getBrowserClient();
                    return [4 /*yield*/, supabase
                            .from('messages')
                            .select('*, sender:sender_id(first_name, last_name, avatar_url), receiver:receiver_id(first_name, last_name, avatar_url)')
                            .eq('match_id', matchId)
                            .order('created_at', { ascending: false })
                            .limit(limit)];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        throw new SupabaseError("Error fetching messages: ".concat(error.message), 500, error.code);
                    }
                    return [2 /*return*/, data];
            }
        });
    });
};
export var markMessagesAsRead = function (matchId, userId) { return __awaiter(void 0, void 0, void 0, function () {
    var supabase, error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                supabase = getBrowserClient();
                return [4 /*yield*/, supabase
                        .from('messages')
                        .update({ is_read: true })
                        .eq('match_id', matchId)
                        .eq('receiver_id', userId)
                        .eq('is_read', false)];
            case 1:
                error = (_a.sent()).error;
                if (error) {
                    throw new SupabaseError("Error marking messages as read: ".concat(error.message), 500, error.code);
                }
                return [2 /*return*/];
        }
    });
}); };
export var createMessage = function (messageData) { return __awaiter(void 0, void 0, void 0, function () {
    var supabase, _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                supabase = getBrowserClient();
                return [4 /*yield*/, supabase
                        .from('messages')
                        .insert(messageData)
                        .select()
                        .single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    throw new SupabaseError("Error creating message: ".concat(error.message), 500, error.code);
                }
                return [2 /*return*/, data];
        }
    });
}); };
export var setupMessageListener = function (matchId, callback) {
    var supabase = getBrowserClient();
    var subscription = supabase
        .channel("match-".concat(matchId, "-messages"))
        .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: "match_id=eq.".concat(matchId)
    }, function (payload) {
        callback(payload.new);
    })
        .subscribe();
    // Return cleanup function
    return function () {
        supabase.removeChannel(subscription);
    };
};
// Export standalone functions for research posts
export var getResearchPost = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, postsApi.getById(id)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
export var updateResearchPost = function (id, data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, postsApi.update(id, data)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
export var deleteResearchPost = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, postsApi.delete(id)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
// Export standalone function for getResearchPosts
export var getResearchPosts = function (options) {
    if (options === void 0) { options = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, posts.getResearchPosts(options)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
// Export standalone function for getMatches
export var getMatches = function (userId, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, matches.getMatches(userId, options)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
// Export standalone function for getProfileStats
export var getProfileStats = function (userId) {
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, profiles.getStats(userId)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
// Export all API methods and functions

    }, function (payload) {
        callback(payload.new);
    })
        .subscribe();
    // Return cleanup function
    return function () {
        supabase.removeChannel(subscription);
    };
};
// Export standalone functions for research posts
export var getResearchPost = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, postsApi.getById(id)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
export var updateResearchPost = function (id, data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, postsApi.update(id, data)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
export var deleteResearchPost = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, postsApi.delete(id)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
// Export standalone function for getResearchPosts
export var getResearchPosts = function (options) {
    if (options === void 0) { options = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, posts.getResearchPosts(options)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
// Export standalone function for getMatches
export var getMatches = function (userId, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, matches.getMatches(userId, options)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
// Export standalone function for getProfileStats
export var getProfileStats = function (userId) {
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, profiles.getStats(userId)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
// Export all API methods and functions
