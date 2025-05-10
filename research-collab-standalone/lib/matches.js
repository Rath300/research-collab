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
import { getSupabaseClient } from './supabaseClient';
export function getPotentialMatches(userId_1) {
    return __awaiter(this, arguments, void 0, function (userId, limit) {
        var supabase, _a, existingMatches, matchError, excludeIds, _b, profiles, profileError;
        if (limit === void 0) { limit = 10; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    supabase = getSupabaseClient();
                    return [4 /*yield*/, supabase
                            .from('matches')
                            .select('user_id_1, user_id_2')
                            .or("user_id_1.eq.".concat(userId, ",user_id_2.eq.").concat(userId))];
                case 1:
                    _a = _c.sent(), existingMatches = _a.data, matchError = _a.error;
                    if (matchError) {
                        console.error('Error fetching existing matches:', matchError);
                        throw matchError;
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
                        console.error('Error fetching potential matches:', profileError);
                        throw profileError;
                    }
                    return [2 /*return*/, profiles];
            }
        });
    });
}
export function createMatch(userId_1, otherUserId_1) {
    return __awaiter(this, arguments, void 0, function (userId, otherUserId, status) {
        var supabase, _a, existingMatch, fetchError, _b, data, error, _c, data, error, matchData, _d, data, error;
        if (status === void 0) { status = 'pending'; }
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    supabase = getSupabaseClient();
                    return [4 /*yield*/, supabase
                            .from('matches')
                            .select('*')
                            .eq('user_id_1', otherUserId)
                            .eq('user_id_2', userId)
                            .eq('status', 'pending')
                            .maybeSingle()];
                case 1:
                    _a = _e.sent(), existingMatch = _a.data, fetchError = _a.error;
                    if (fetchError) {
                        console.error('Error checking for existing match:', fetchError);
                        throw fetchError;
                    }
                    if (!existingMatch) return [3 /*break*/, 6];
                    if (!(status === 'pending' || status === 'matched')) return [3 /*break*/, 3];
                    return [4 /*yield*/, supabase
                            .from('matches')
                            .update({ status: 'matched', updated_at: new Date().toISOString() })
                            .eq('id', existingMatch.id)
                            .select()
                            .single()];
                case 2:
                    _b = _e.sent(), data = _b.data, error = _b.error;
                    if (error) {
                        console.error('Error updating match:', error);
                        throw error;
                    }
                    return [2 /*return*/, data];
                case 3: return [4 /*yield*/, supabase
                        .from('matches')
                        .update({ status: 'rejected', updated_at: new Date().toISOString() })
                        .eq('id', existingMatch.id)
                        .select()
                        .single()];
                case 4:
                    _c = _e.sent(), data = _c.data, error = _c.error;
                    if (error) {
                        console.error('Error rejecting match:', error);
                        throw error;
                    }
                    return [2 /*return*/, data];
                case 5: return [3 /*break*/, 8];
                case 6:
                    matchData = {
                        user_id_1: userId,
                        user_id_2: otherUserId,
                        status: status,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };
                    return [4 /*yield*/, supabase
                            .from('matches')
                            .insert(matchData)
                            .select()
                            .single()];
                case 7:
                    _d = _e.sent(), data = _d.data, error = _d.error;
                    if (error) {
                        console.error('Error creating match:', error);
                        throw error;
                    }
                    return [2 /*return*/, data];
                case 8: return [2 /*return*/];
            }
        });
    });
}
export function getMatches(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    supabase = getSupabaseClient();
                    return [4 /*yield*/, supabase
                            .from('matches')
                            .select("\n      *,\n      user1:user_id_1(id, first_name, last_name, avatar_url, title, institution),\n      user2:user_id_2(id, first_name, last_name, avatar_url, title, institution)\n    ")
                            .or("user_id_1.eq.".concat(userId, ",user_id_2.eq.").concat(userId))
                            .eq('status', 'matched')];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching matches:', error);
                        throw error;
                    }
                    return [2 /*return*/, data];
            }
        });
    });
}
