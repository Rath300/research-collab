"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectTaskSchema = exports.taskPrioritySchema = exports.taskStatusSchema = void 0;
var zod_1 = require("zod");
exports.taskStatusSchema = zod_1.z.enum([
    'todo',
    'in_progress',
    'completed',
    'archived'
]);
exports.taskPrioritySchema = zod_1.z.enum([
    'low',
    'medium',
    'high',
    'urgent'
]);
exports.projectTaskSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    project_id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1, { message: "Title is required." }),
    description: zod_1.z.string().nullable().optional(),
    status: exports.taskStatusSchema,
    priority: exports.taskPrioritySchema.nullable().optional(),
    assignee_user_id: zod_1.z.string().uuid().nullable().optional(),
    reporter_user_id: zod_1.z.string().uuid(),
    due_date: zod_1.z.coerce.date().nullable().optional(),
    order: zod_1.z.number().int().nullable().optional(), // Keep as number for Zod, PG stores as integer
    created_at: zod_1.z.coerce.date(),
    updated_at: zod_1.z.coerce.date(),
});
