"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResearchPosts = getResearchPosts;
exports.getResearchPost = getResearchPost;
exports.createResearchPost = createResearchPost;
exports.updateResearchPost = updateResearchPost;
exports.deleteResearchPost = deleteResearchPost;
exports.incrementEngagement = incrementEngagement;
var supabaseClient_1 = require("./supabaseClient");
function getResearchPosts() {
    return __awaiter(this, arguments, void 0, function (limit, offset, userId) {
        var supabase, query;
        if (limit === void 0) { limit = 10; }
        if (offset === void 0) { offset = 0; }
        return __generator(this, function (_a) {
            supabase = (0, supabaseClient_1.createClient)();
            query = supabase
                .from('research_posts')
                .select("\n      *,\n      profiles:user_id (\n        id,\n        first_name,\n        last_name,\n        avatar_url\n      )\n    ")
                .order('created_at', { ascending: false })
                .limit(limit)
                .range(offset, offset + limit - 1);
            if (userId) {
                query = query.eq('user_id', userId);
            }
            return [2 /*return*/, query];
        });
    });
}
function getResearchPost(id) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase;
        return __generator(this, function (_a) {
            supabase = (0, supabaseClient_1.createClient)();
            return [2 /*return*/, supabase
                    .from('research_posts')
                    .select("\n      *,\n      profiles:user_id (\n        id,\n        first_name,\n        last_name,\n        avatar_url,\n        bio,\n        title,\n        institution\n      )\n    ")
                    .eq('id', id)
                    .single()];
        });
    });
}
function createResearchPost(post) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase;
        return __generator(this, function (_a) {
            supabase = (0, supabaseClient_1.createClient)();
            return [2 /*return*/, supabase
                    .from('research_posts')
                    .insert(post)
                    .select()
                    .single()];
        });
    });
}
function updateResearchPost(id, post) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase;
        return __generator(this, function (_a) {
            supabase = (0, supabaseClient_1.createClient)();
            return [2 /*return*/, supabase
                    .from('research_posts')
                    .update(post)
                    .eq('id', id)
                    .select()
                    .single()];
        });
    });
}
function deleteResearchPost(id) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase;
        return __generator(this, function (_a) {
            supabase = (0, supabaseClient_1.createClient)();
            return [2 /*return*/, supabase
                    .from('research_posts')
                    .delete()
                    .eq('id', id)];
        });
    });
}
function incrementEngagement(id) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, post, getError;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    supabase = (0, supabaseClient_1.createClient)();
                    return [4 /*yield*/, supabase
                            .from('research_posts')
                            .select('engagement_count')
                            .eq('id', id)
                            .single()];
                case 1:
                    _a = _b.sent(), post = _a.data, getError = _a.error;
                    if (getError) {
                        return [2 /*return*/, { data: null, error: getError }];
                    }
                    // Then increment it
                    return [2 /*return*/, supabase
                            .from('research_posts')
                            .update({
                            engagement_count: (post.engagement_count || 0) + 1
                        })
                            .eq('id', id)
                            .select()
                            .single()];
            }
        });
    });
}
