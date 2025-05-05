import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TaskManager } from "./task-manager";
import { CodeSyncManager } from "./code-sync-manager";
import { clientSchema } from "./schemas";

export interface Env {
    MCP_OBJECT: DurableObjectNamespace;
    CLAUDE_CURSOR_SYNC: DurableObjectNamespace;
    DEBUG?: string;
    PHASE?: string;
}

// Keep the old MyMCP class for backward compatibility with existing Durable Objects
export class MyMCP extends McpAgent {
    server = new McpServer({
        name: "Claude-Cursor Sync Bridge Legacy",
        version: "1.0.0",
    });

    async init() {
        console.log("Legacy MyMCP class initialized");
        
        // Simple health check tool
        this.server.tool(
            "legacy_health",
            {},
            async () => {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({ 
                                success: true, 
                                message: "Legacy MyMCP is healthy",
                                migrationStatus: "Please use ClaudeCursorSyncMCP for new functionality"
                            })
                        }
                    ],
                };
            }
        );
    }
}

// Define our MCP agent with tools
export class ClaudeCursorSyncMCP extends McpAgent {
    server = new McpServer({
        name: "Claude-Cursor Sync Bridge",
        version: "1.0.0",
    });
    
    taskManager = new TaskManager();
    codeSyncManager = new CodeSyncManager();

    async init() {
        // Task creation tool
        this.server.tool(
            "task_create",
            {
                clientId: z.string(),
                clientType: z.string(),
                title: z.string(),
                description: z.string(),
                status: z.enum(["pending", "in-progress", "completed", "cancelled"]),
                priority: z.enum(["high", "medium", "low"]),
                assignedTo: z.string().optional(),
                dueDate: z.string().optional(),
                tags: z.array(z.string()).optional(),
            },
            async (params) => {
                try {
                    const client = clientSchema.parse({
                        id: params.clientId,
                        type: params.clientType
                    });
                    
                    const task = await this.taskManager.createTask({
                        ...params,
                        client
                    });
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ 
                                    success: true, 
                                    message: "Task created successfully",
                                    task
                                })
                            }
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ 
                                    success: false, 
                                    message: `Error creating task: ${error instanceof Error ? error.message : String(error)}`
                                })
                            }
                        ],
                    };
                }
            }
        );

        // Task query tool
        this.server.tool(
            "task_query",
            {
                clientId: z.string(),
                clientType: z.string(),
                status: z.enum(["pending", "in-progress", "completed", "cancelled"]).optional(),
                priority: z.enum(["high", "medium", "low"]).optional(),
                assignedTo: z.string().optional(),
                tags: z.array(z.string()).optional(),
            },
            async (params) => {
                try {
                    const client = clientSchema.parse({
                        id: params.clientId,
                        type: params.clientType
                    });
                    
                    const tasks = await this.taskManager.queryTasks({
                        ...params,
                        client
                    });
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ 
                                    success: true, 
                                    tasks
                                })
                            }
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ 
                                    success: false, 
                                    message: `Error querying tasks: ${error instanceof Error ? error.message : String(error)}`
                                })
                            }
                        ],
                    };
                }
            }
        );

        // Task status update tool
        this.server.tool(
            "task_status_update",
            {
                clientId: z.string(),
                clientType: z.string(),
                taskId: z.string(),
                status: z.enum(["pending", "in-progress", "completed", "cancelled"]),
            },
            async (params) => {
                try {
                    const client = clientSchema.parse({
                        id: params.clientId,
                        type: params.clientType
                    });
                    
                    const task = await this.taskManager.updateTaskStatus({
                        taskId: params.taskId,
                        status: params.status,
                        client
                    });
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ 
                                    success: true, 
                                    message: "Task status updated successfully",
                                    task
                                })
                            }
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ 
                                    success: false, 
                                    message: `Error updating task status: ${error instanceof Error ? error.message : String(error)}`
                                })
                            }
                        ],
                    };
                }
            }
        );

        // Code snippet sharing tool
        this.server.tool(
            "code_snippet",
            {
                clientId: z.string(),
                clientType: z.string(),
                code: z.string(),
                language: z.string(),
                fileName: z.string().optional(),
                description: z.string().optional(),
                context: z.string().optional(),
                taskId: z.string().optional(),
            },
            async (params) => {
                try {
                    const client = clientSchema.parse({
                        id: params.clientId,
                        type: params.clientType
                    });
                    
                    const snippet = await this.codeSyncManager.shareCodeSnippet({
                        ...params,
                        client
                    });
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ 
                                    success: true, 
                                    message: "Code snippet shared successfully",
                                    snippet
                                })
                            }
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ 
                                    success: false, 
                                    message: `Error sharing code snippet: ${error instanceof Error ? error.message : String(error)}`
                                })
                            }
                        ],
                    };
                }
            }
        );
        
        // Implementation details sharing tool
        this.server.tool(
            "implementation_details",
            {
                clientId: z.string(),
                clientType: z.string(),
                taskId: z.string(),
                details: z.string(),
                status: z.enum(["planning", "implemented", "needs-review"]),
            },
            async (params) => {
                try {
                    const client = clientSchema.parse({
                        id: params.clientId,
                        type: params.clientType
                    });
                    
                    const details = await this.taskManager.addImplementationDetails({
                        taskId: params.taskId,
                        details: params.details,
                        status: params.status,
                        client
                    });
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ 
                                    success: true, 
                                    message: "Implementation details added successfully",
                                    details
                                })
                            }
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ 
                                    success: false, 
                                    message: `Error adding implementation details: ${error instanceof Error ? error.message : String(error)}`
                                })
                            }
                        ],
                    };
                }
            }
        );
        
        // Message broadcast tool
        this.server.tool(
            "message_broadcast",
            {
                clientId: z.string(),
                clientType: z.string(),
                message: z.string(),
                targetClientId: z.string().optional(),
                targetClientType: z.string().optional(),
                taskId: z.string().optional(),
            },
            async (params) => {
                try {
                    const client = clientSchema.parse({
                        id: params.clientId,
                        type: params.clientType
                    });
                    
                    // Using a combination of task manager and code sync manager for messaging
                    const result = await this.codeSyncManager.broadcastMessage({
                        ...params,
                        client
                    });
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ 
                                    success: true, 
                                    message: "Message broadcast successfully",
                                    result
                                })
                            }
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ 
                                    success: false, 
                                    message: `Error broadcasting message: ${error instanceof Error ? error.message : String(error)}`
                                })
                            }
                        ],
                    };
                }
            }
        );
    }
}

// Durable Object Implementation for data persistence
export class ClaudeCursorSyncDO {
    state: DurableObjectState;

    constructor(state: DurableObjectState) {
        this.state = state;
    }

    async fetch(request: Request) {
        const url = new URL(request.url);
        const path = url.pathname;

        if (request.method === "GET") {
            if (path === "/tasks") {
                const tasks = await this.state.storage.get("tasks") || {};
                return new Response(JSON.stringify(tasks), {
                    headers: { "Content-Type": "application/json" }
                });
            } else if (path === "/snippets") {
                const snippets = await this.state.storage.get("snippets") || {};
                return new Response(JSON.stringify(snippets), {
                    headers: { "Content-Type": "application/json" }
                });
            } else if (path.startsWith("/task/")) {
                const taskId = path.replace("/task/", "");
                const tasks = await this.state.storage.get("tasks") || {};
                const task = tasks[taskId];
                
                if (!task) {
                    return new Response(JSON.stringify({ error: "Task not found" }), {
                        status: 404,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                
                return new Response(JSON.stringify(task), {
                    headers: { "Content-Type": "application/json" }
                });
            }
        } else if (request.method === "POST") {
            const data = await request.json();
            
            if (path === "/tasks") {
                const tasks = await this.state.storage.get("tasks") || {};
                const taskId = crypto.randomUUID();
                tasks[taskId] = { ...data, id: taskId, createdAt: new Date().toISOString() };
                await this.state.storage.put("tasks", tasks);
                
                return new Response(JSON.stringify(tasks[taskId]), {
                    headers: { "Content-Type": "application/json" }
                });
            } else if (path === "/snippets") {
                const snippets = await this.state.storage.get("snippets") || {};
                const snippetId = crypto.randomUUID();
                snippets[snippetId] = { ...data, id: snippetId, createdAt: new Date().toISOString() };
                await this.state.storage.put("snippets", snippets);
                
                return new Response(JSON.stringify(snippets[snippetId]), {
                    headers: { "Content-Type": "application/json" }
                });
            } else if (path === "/messages") {
                const messages = await this.state.storage.get("messages") || [];
                const messageId = crypto.randomUUID();
                const message = { ...data, id: messageId, timestamp: new Date().toISOString() };
                messages.push(message);
                await this.state.storage.put("messages", messages);
                
                return new Response(JSON.stringify(message), {
                    headers: { "Content-Type": "application/json" }
                });
            }
        } else if (request.method === "PUT") {
            if (path.startsWith("/task/")) {
                const taskId = path.replace("/task/", "");
                const tasks = await this.state.storage.get("tasks") || {};
                
                if (!tasks[taskId]) {
                    return new Response(JSON.stringify({ error: "Task not found" }), {
                        status: 404,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                
                const data = await request.json();
                tasks[taskId] = { ...tasks[taskId], ...data, updatedAt: new Date().toISOString() };
                await this.state.storage.put("tasks", tasks);
                
                return new Response(JSON.stringify(tasks[taskId]), {
                    headers: { "Content-Type": "application/json" }
                });
            } else if (path.startsWith("/snippet/")) {
                const snippetId = path.replace("/snippet/", "");
                const snippets = await this.state.storage.get("snippets") || {};
                
                if (!snippets[snippetId]) {
                    return new Response(JSON.stringify({ error: "Snippet not found" }), {
                        status: 404,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                
                const data = await request.json();
                snippets[snippetId] = { ...snippets[snippetId], ...data, updatedAt: new Date().toISOString() };
                await this.state.storage.put("snippets", snippets);
                
                return new Response(JSON.stringify(snippets[snippetId]), {
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        return new Response("Not found", { status: 404 });
    }
}

export default {
    fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url);
        const phase = env.PHASE || "1";
        const isDebug = env.DEBUG === "true";

        // Handle legacy MyMCP requests
        if (url.pathname === "/sse/legacy" || url.pathname === "/sse/message/legacy") {
            if (isDebug) console.log("Serving legacy SSE request");
            // @ts-ignore - Types might not match exactly but this works with MCP
            return MyMCP.serveSSE("/sse/legacy").fetch(request, env, ctx);
        }

        if (url.pathname === "/mcp/legacy") {
            if (isDebug) console.log("Serving legacy MCP request");
            // @ts-ignore - Types might not match exactly but this works with MCP
            return MyMCP.serve("/mcp/legacy").fetch(request, env, ctx);
        }
        
        // Handle new ClaudeCursorSyncMCP requests - fully enabled in Phase 2
        if (url.pathname === "/sse" || url.pathname === "/sse/message") {
            if (phase === "2") {
                if (isDebug) console.log("Serving new SSE request in Phase 2");
                // @ts-ignore - Types might not match exactly but this works with MCP
                return ClaudeCursorSyncMCP.serveSSE("/sse").fetch(request, env, ctx);
            } else {
                // Return temporary message if still in Phase 1
                return new Response(JSON.stringify({
                    status: "pending",
                    message: "The new Claude-Cursor Sync Bridge endpoints are coming soon. Please use /sse/legacy and /mcp/legacy for now."
                }), {
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        if (url.pathname === "/mcp") {
            if (phase === "2") {
                if (isDebug) console.log("Serving new MCP request in Phase 2");
                // @ts-ignore - Types might not match exactly but this works with MCP
                return ClaudeCursorSyncMCP.serve("/mcp").fetch(request, env, ctx);
            } else {
                // Return temporary message if still in Phase 1
                return new Response(JSON.stringify({
                    status: "pending",
                    message: "The new Claude-Cursor Sync Bridge endpoints are coming soon. Please use /sse/legacy and /mcp/legacy for now."
                }), {
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        // Add a simple health check
        if (url.pathname === "/health") {
            return new Response(JSON.stringify({
                status: "ok",
                version: "1.0.0",
                name: "Claude-Cursor Sync Bridge",
                phase: phase,
                endpoints: {
                    legacy: ["/mcp/legacy", "/sse/legacy"],
                    current: phase === "2" ? ["/mcp", "/sse"] : "coming soon"
                }
            }), {
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }

        return new Response("Not found", { status: 404 });
    },
};