import { z } from 'zod';
export declare const taskStatusSchema: z.ZodEnum<["todo", "in_progress", "completed", "archived"]>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export declare const taskPrioritySchema: z.ZodEnum<["low", "medium", "high", "urgent"]>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export declare const projectTaskSchema: z.ZodObject<{
    id: z.ZodString;
    project_id: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodEnum<["todo", "in_progress", "completed", "archived"]>;
    priority: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "medium", "high", "urgent"]>>>;
    assignee_user_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    reporter_user_id: z.ZodString;
    due_date: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    order: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    project_id: string;
    created_at: Date;
    title: string;
    updated_at: Date;
    status: "todo" | "in_progress" | "completed" | "archived";
    reporter_user_id: string;
    description?: string | null | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | null | undefined;
    assignee_user_id?: string | null | undefined;
    due_date?: Date | null | undefined;
    order?: number | null | undefined;
}, {
    id: string;
    project_id: string;
    created_at: Date;
    title: string;
    updated_at: Date;
    status: "todo" | "in_progress" | "completed" | "archived";
    reporter_user_id: string;
    description?: string | null | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | null | undefined;
    assignee_user_id?: string | null | undefined;
    due_date?: Date | null | undefined;
    order?: number | null | undefined;
}>;
export type ProjectTask = z.infer<typeof projectTaskSchema>;
//# sourceMappingURL=task.d.ts.map