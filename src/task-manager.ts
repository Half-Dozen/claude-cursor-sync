import {
    Task,
    CreateTaskInput,
    QueryTasksInput,
    UpdateTaskStatusInput,
    AddImplementationDetailsInput,
    createTaskInputSchema,
    queryTasksInputSchema,
    updateTaskStatusInputSchema,
    addImplementationDetailsInputSchema
} from "./schemas";

/**
 * Manager class for all task-related operations
 */
export class TaskManager {
    private tasks: Record<string, Task> = {};
    
    /**
     * Creates a new task
     * @param input Task creation input
     * @returns The created task
     */
    async createTask(input: CreateTaskInput): Promise<Task> {
        const validatedInput = createTaskInputSchema.parse(input);
        
        const taskId = crypto.randomUUID();
        const now = new Date().toISOString();
        
        const task: Task = {
            id: taskId,
            title: validatedInput.title,
            description: validatedInput.description,
            status: validatedInput.status,
            priority: validatedInput.priority,
            createdBy: validatedInput.client,
            assignedTo: validatedInput.assignedTo,
            dueDate: validatedInput.dueDate,
            tags: validatedInput.tags,
            createdAt: now,
            updatedAt: now,
            implementationDetails: []
        };
        
        this.tasks[taskId] = task;
        
        // In a real implementation, we would persist this to Durable Objects storage
        // await this.storage.put("tasks", this.tasks);
        
        return task;
    }
    
    /**
     * Queries tasks based on filter criteria
     * @param input Query parameters
     * @returns Array of tasks matching the criteria
     */
    async queryTasks(input: QueryTasksInput): Promise<Task[]> {
        const validatedInput = queryTasksInputSchema.parse(input);
        
        // In a real implementation, we would load from Durable Objects storage
        // this.tasks = await this.storage.get("tasks") || {};
        
        return Object.values(this.tasks).filter(task => {
            // Match status if provided
            if (validatedInput.status && task.status !== validatedInput.status) {
                return false;
            }
            
            // Match priority if provided
            if (validatedInput.priority && task.priority !== validatedInput.priority) {
                return false;
            }
            
            // Match assignedTo if provided
            if (validatedInput.assignedTo && task.assignedTo !== validatedInput.assignedTo) {
                return false;
            }
            
            // Match any of the tags if provided
            if (validatedInput.tags && validatedInput.tags.length > 0 && task.tags) {
                if (!task.tags.some(tag => validatedInput.tags?.includes(tag))) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    /**
     * Updates the status of a task
     * @param input Status update parameters
     * @returns The updated task
     */
    async updateTaskStatus(input: UpdateTaskStatusInput): Promise<Task> {
        const validatedInput = updateTaskStatusInputSchema.parse(input);
        
        // In a real implementation, we would load from Durable Objects storage
        // this.tasks = await this.storage.get("tasks") || {};
        
        const task = this.tasks[validatedInput.taskId];
        if (!task) {
            throw new Error(`Task with ID ${validatedInput.taskId} not found`);
        }
        
        // Update task status
        task.status = validatedInput.status;
        task.updatedAt = new Date().toISOString();
        
        // Save the updated task
        this.tasks[validatedInput.taskId] = task;
        
        // In a real implementation, we would persist this to Durable Objects storage
        // await this.storage.put("tasks", this.tasks);
        
        return task;
    }
    
    /**
     * Adds implementation details to a task
     * @param input Implementation details parameters
     * @returns The updated task
     */
    async addImplementationDetails(input: AddImplementationDetailsInput): Promise<Task> {
        const validatedInput = addImplementationDetailsInputSchema.parse(input);
        
        // In a real implementation, we would load from Durable Objects storage
        // this.tasks = await this.storage.get("tasks") || {};
        
        const task = this.tasks[validatedInput.taskId];
        if (!task) {
            throw new Error(`Task with ID ${validatedInput.taskId} not found`);
        }
        
        // Initialize implementation details array if it doesn't exist
        if (!task.implementationDetails) {
            task.implementationDetails = [];
        }
        
        // Add new implementation details
        task.implementationDetails.push({
            details: validatedInput.details,
            status: validatedInput.status,
            createdBy: validatedInput.client,
            createdAt: new Date().toISOString()
        });
        
        task.updatedAt = new Date().toISOString();
        
        // Save the updated task
        this.tasks[validatedInput.taskId] = task;
        
        // In a real implementation, we would persist this to Durable Objects storage
        // await this.storage.put("tasks", this.tasks);
        
        return task;
    }
    
    /**
     * Gets a task by ID
     * @param taskId The task ID
     * @returns The task if found
     */
    async getTask(taskId: string): Promise<Task> {
        // In a real implementation, we would load from Durable Objects storage
        // this.tasks = await this.storage.get("tasks") || {};
        
        const task = this.tasks[taskId];
        if (!task) {
            throw new Error(`Task with ID ${taskId} not found`);
        }
        
        return task;
    }
}