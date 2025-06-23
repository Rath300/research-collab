"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
exports.Constants = {
    public: {
        Enums: {
            project_collaborator_role: ["owner", "editor", "viewer"],
            project_collaborator_status: ["pending", "active", "declined", "revoked"],
            project_task_priority: ["low", "medium", "high", "urgent"],
            project_task_status: ["todo", "in_progress", "completed", "archived"],
            workspace_document_type: [
                "Text Document",
                "Code Notebook",
                "Research Proposal",
                "Methodology",
                "Data Analysis",
                "Literature Review",
                "Generic Document",
            ],
            workspace_role: ["owner", "admin", "editor", "commenter", "viewer"],
            workspace_task_status: [
                "todo",
                "in_progress",
                "review",
                "completed",
                "archived",
            ],
        },
    },
};
