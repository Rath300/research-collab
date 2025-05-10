/**
 * Generates a content hash for proof of work
 *
 * @param content The content to hash
 * @returns A string representation of the content hash
 */
export function generateContentHash(content) {
    if (typeof window === 'undefined') {
        // Server-side implementation (Node.js)
        var crypto_1 = require('crypto');
        return crypto_1.createHash('sha256').update(content).digest('hex');
    }
    else {
        // Client-side implementation (Browser)
        // Using a simple hash function for the browser
        var hash = 0;
        for (var i = 0; i < content.length; i++) {
            var char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(16);
    }
}
/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString) {
    var date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}
/**
 * Format a date string to a relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(dateString) {
    var date = new Date(dateString);
    var now = new Date();
    var diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) {
        return "".concat(diffInSeconds, " seconds ago");
    }
    var diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return "".concat(diffInMinutes, " ").concat(diffInMinutes === 1 ? 'minute' : 'minutes', " ago");
    }
    var diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return "".concat(diffInHours, " ").concat(diffInHours === 1 ? 'hour' : 'hours', " ago");
    }
    var diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return "".concat(diffInDays, " ").concat(diffInDays === 1 ? 'day' : 'days', " ago");
    }
    var diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return "".concat(diffInMonths, " ").concat(diffInMonths === 1 ? 'month' : 'months', " ago");
    }
    var diffInYears = Math.floor(diffInMonths / 12);
    return "".concat(diffInYears, " ").concat(diffInYears === 1 ? 'year' : 'years', " ago");
}
/**
 * Truncate a string to a specified length and add ellipsis
 */
export function truncateText(text, length) {
    if (text.length <= length)
        return text;
    return "".concat(text.substring(0, length), "...");
}
/**
 * Safely access nested properties without throwing errors
 */
export function safelyAccessNestedProp(obj, path, defaultValue) {
    try {
        var keys = path.split('.');
        var current = obj;
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (current === null || current === undefined) {
                return defaultValue;
            }
            current = current[key];
        }
        return current === undefined || current === null ? defaultValue : current;
    }
    catch (error) {
        return defaultValue;
    }
}
/**
 * Group an array of objects by a key
 */
export function groupBy(array, key) {
    return array.reduce(function (result, currentItem) {
        var groupKey = String(currentItem[key]);
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(currentItem);
        return result;
    }, {});
}
