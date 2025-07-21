import { z } from 'zod';
export declare const projectMessageTypeSchema: z.ZodEnum<["text"]>;
export type ProjectMessageType = z.infer<typeof projectMessageTypeSchema>;
export declare const projectChatMessageSchema: z.ZodObject<{
    id: z.ZodString;
    project_id: z.ZodString;
    user_id: z.ZodString;
    content: z.ZodString;
    parent_message_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    message_type: z.ZodDefault<z.ZodEnum<["text"]>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    project_id: string;
    created_at: Date;
    updated_at: Date;
    content: string;
    message_type: "text";
    parent_message_id?: string | null | undefined;
}, {
    id: string;
    user_id: string;
    project_id: string;
    created_at: Date;
    updated_at: Date;
    content: string;
    parent_message_id?: string | null | undefined;
    message_type?: "text" | undefined;
}>;
export type ProjectChatMessage = z.infer<typeof projectChatMessageSchema>;
//# sourceMappingURL=chat_message.d.ts.map