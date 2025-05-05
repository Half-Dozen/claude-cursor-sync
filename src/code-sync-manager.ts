import {
    CodeSnippet,
    Message,
    ShareCodeSnippetInput,
    BroadcastMessageInput,
    shareCodeSnippetInputSchema,
    broadcastMessageInputSchema
} from "./schemas";

/**
 * Manager class for code synchronization and messaging functionality
 */
export class CodeSyncManager {
    private snippets: Record<string, CodeSnippet> = {};
    private messages: Message[] = [];
    
    /**
     * Shares a code snippet between clients
     * @param input Code snippet parameters
     * @returns The created code snippet
     */
    async shareCodeSnippet(input: ShareCodeSnippetInput): Promise<CodeSnippet> {
        const validatedInput = shareCodeSnippetInputSchema.parse(input);
        
        const snippetId = crypto.randomUUID();
        const now = new Date().toISOString();
        
        const snippet: CodeSnippet = {
            id: snippetId,
            code: validatedInput.code,
            language: validatedInput.language,
            fileName: validatedInput.fileName,
            description: validatedInput.description,
            context: validatedInput.context,
            taskId: validatedInput.taskId,
            createdBy: validatedInput.client,
            createdAt: now,
            updatedAt: now
        };
        
        this.snippets[snippetId] = snippet;
        
        // In a real implementation, we would persist this to Durable Objects storage
        // await this.storage.put("snippets", this.snippets);
        
        return snippet;
    }
    
    /**
     * Broadcasts a message to other clients
     * @param input Message parameters
     * @returns The created message
     */
    async broadcastMessage(input: BroadcastMessageInput): Promise<Message> {
        const validatedInput = broadcastMessageInputSchema.parse(input);
        
        const messageId = crypto.randomUUID();
        const now = new Date().toISOString();
        
        let toClient = undefined;
        if (validatedInput.targetClientId && validatedInput.targetClientType) {
            toClient = {
                id: validatedInput.targetClientId,
                type: validatedInput.targetClientType
            };
        }
        
        const message: Message = {
            id: messageId,
            message: validatedInput.message,
            fromClient: validatedInput.client,
            toClient,
            taskId: validatedInput.taskId,
            timestamp: now
        };
        
        this.messages.push(message);
        
        // In a real implementation, we would persist this to Durable Objects storage
        // const messages = await this.storage.get("messages") || [];
        // messages.push(message);
        // await this.storage.put("messages", messages);
        
        return message;
    }
    
    /**
     * Gets all snippets for a task
     * @param taskId The task ID
     * @returns Array of snippets for the task
     */
    async getSnippetsForTask(taskId: string): Promise<CodeSnippet[]> {
        // In a real implementation, we would load from Durable Objects storage
        // this.snippets = await this.storage.get("snippets") || {};
        
        return Object.values(this.snippets).filter(snippet => 
            snippet.taskId === taskId
        );
    }
    
    /**
     * Gets all messages for a task
     * @param taskId The task ID
     * @returns Array of messages for the task
     */
    async getMessagesForTask(taskId: string): Promise<Message[]> {
        // In a real implementation, we would load from Durable Objects storage
        // this.messages = await this.storage.get("messages") || [];
        
        return this.messages.filter(message => 
            message.taskId === taskId
        );
    }
    
    /**
     * Gets all messages for a client
     * @param clientId The client ID
     * @param clientType The client type
     * @returns Array of messages for the client
     */
    async getMessagesForClient(clientId: string, clientType: string): Promise<Message[]> {
        // In a real implementation, we would load from Durable Objects storage
        // this.messages = await this.storage.get("messages") || [];
        
        return this.messages.filter(message => 
            (message.toClient?.id === clientId && message.toClient?.type === clientType) ||
            // Also include messages without a specific recipient
            message.toClient === undefined
        );
    }
}