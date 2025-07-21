"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
exports.createServerClient = createServerClient;
var ssr_1 = require("@supabase/ssr");
function createClient() {
    return (0, ssr_1.createBrowserClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
// For server-side usage
function createServerClient(cookieStore) {
    return (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            get: function (name) {
                var _a;
                return (_a = cookieStore.get(name)) === null || _a === void 0 ? void 0 : _a.value;
            },
            set: function (name, value, options) {
                cookieStore.set(__assign({ name: name, value: value }, options));
            },
            remove: function (name, options) {
                cookieStore.set(__assign({ name: name, value: '' }, options));
            },
        },
    });
}
