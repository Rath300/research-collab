"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectChatMessageSchema = exports.projectMessageTypeSchema = void 0;
var zod_1 = require("zod");
exports.projectMessageTypeSchema = zod_1.z.enum(['text' /*, 'file', 'system' */]); // Extendable
exports.projectChatMessageSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    project_id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(), // Sender
    content: zod_1.z.string().min(1, "Message content cannot be empty."),
    parent_message_id: zod_1.z.string().uuid().nullable().optional(),
    message_type: exports.projectMessageTypeSchema.default('text'),
    created_at: zod_1.z.coerce.date(),
    updated_at: zod_1.z.coerce.date(), // For message editing
});
