import { z } from "zod";

// Client identification schema
export const clientSchema = z.object({
    id: z.string(),
    type: z.string()
});

export type Client = z.infer<typeof clientSchema>;

// Task schema
export const taskSchema = z.object({
    id: z.string().optional(), // Will be generated if not provided
    title: z.string(),
    description: z.string(),
    status: z.enum(["pending", "in-progress", "completed", "cancelled"]),
    priority: z.enum(["high", "medium", "low"]),
    createdBy: clientSchema,
    assignedTo: z.string().optional(),
    dueDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    implementationDetails: z.array(
        z.object({
            details: z.string(),
            status: z.enum(["planning", "implemented", "needs-review"]),
            createdBy: clientSchema,
            createdAt: z.string().datetime()
        })
    ).optional()
});

export type Task = z.infer<typeof taskSchema>;

// Code snippet schema
export const codeSnippetSchema = z.object({
    id: z.string().optional(), // Will be generated if not provided
    code: z.string(),
    language: z.string(),
    fileName: z.string().optional(),
    description: z.string().optional(),
    context: z.string().optional(),
    taskId: z.string().optional(),
    createdBy: clientSchema,
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional()
});

export type CodeSnippet = z.infer<typeof codeSnippetSchema>;

// Message schema
export const messageSchema = z.object({
    id: z.string().optional(), // Will be generated if not provided
    message: z.string(),
    fromClient: clientSchema,
    toClient: clientSchema.optional(),
    taskId: z.string().optional(),
    timestamp: z.string().datetime().optional()
});

export type Message = z.infer<typeof messageSchema>;

// Create task input schema
export const createTaskInputSchema = z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(["pending", "in-progress", "completed", "cancelled"]),
    priority: z.enum(["high", "medium", "low"]),
    client: clientSchema,
    assignedTo: z.string().optional(),
    dueDate: z.string().optional(),
    tags: z.array(z.string()).optional()
});

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

// Query tasks input schema
export const queryTasksInputSchema = z.object({
    client: clientSchema,
    status: z.enum(["pending", "in-progress", "completed", "cancelled"]).optional(),
    priority: z.enum(["high", "medium", "low"]).optional(),
    assignedTo: z.string().optional(),
    tags: z.array(z.string()).optional()
});

export type QueryTasksInput = z.infer<typeof queryTasksInputSchema>;

// Update task status input schema
export const updateTaskStatusInputSchema = z.object({
    taskId: z.string(),
    status: z.enum(["pending", "in-progress", "completed", "cancelled"]),
    client: clientSchema
});

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusInputSchema>;

// Add implementation details input schema
export const addImplementationDetailsInputSchema = z.object({
    taskId: z.string(),
    details: z.string(),
    status: z.enum(["planning", "implemented", "needs-review"]),
    client: clientSchema
});

export type AddImplementationDetailsInput = z.infer<typeof addImplementationDetailsInputSchema>;

// Share code snippet input schema
export const shareCodeSnippetInputSchema = z.object({
    code: z.string(),
    language: z.string(),
    client: clientSchema,
    fileName: z.string().optional(),
    description: z.string().optional(),
    context: z.string().optional(),
    taskId: z.string().optional()
});

export type ShareCodeSnippetInput = z.infer<typeof shareCodeSnippetInputSchema>;

// Broadcast message input schema
export const broadcastMessageInputSchema = z.object({
    message: z.string(),
    client: clientSchema,
    targetClientId: z.string().optional(),
    targetClientType: z.string().optional(),
    taskId: z.string().optional()
});

export type BroadcastMessageInput = z.infer<typeof broadcastMessageInputSchema>;