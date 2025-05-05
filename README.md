# Claude-Cursor Sync Bridge

A Model Context Protocol (MCP) implementation that enables bidirectional synchronization between Claude Code and Cursor for collaborative coding projects. This bridge facilitates the exchange of tasks, code snippets, implementation details, and messages between Claude Code in a terminal and Cursor chat.

## Features

- **Task Management**: Create, query, and update tasks with metadata
- **Code Snippet Sharing**: Share code between Claude Code and Cursor
- **Implementation Details**: Document approach and implementation status
- **Messaging**: Send messages between clients for coordination
- **Persistent Storage**: Store all data using Cloudflare Durable Objects

## Architecture

The system consists of:

1. **MCP Server**: Cloudflare Worker implementing MCP protocol
2. **Task Manager**: Handles task CRUD operations
3. **Code Sync Manager**: Manages code snippets and messaging
4. **Durable Object**: Persistent storage for tasks, snippets, and messages

## API Tools

### Task Management

- `task.create`: Create a new task with details
- `task.query`: Query tasks based on filters
- `task.status.update`: Update a task's status

### Code & Implementation

- `code.snippet`: Share code between clients
- `implementation.details`: Document implementation approach and status

### Communication

- `message.broadcast`: Send messages between clients

## Usage Examples

### Claude Desktop

Create a task:
```
<function_calls>
<invoke name="task.create">
<parameter name="clientId">claude-desktop</parameter>
<parameter name="clientType">claude-code</parameter>
<parameter name="title">Test Task from Claude Desktop</parameter>
<parameter name="description">This is a test task created to verify the Claude-Cursor sync integration</parameter>
<parameter name="status">pending</parameter>
<parameter name="priority">high</parameter>
</invoke>
</function_calls>
```

Query tasks:
```
<function_calls>
<invoke name="task.query">
<parameter name="clientId">claude-desktop</parameter>
<parameter name="clientType">claude-code</parameter>
</invoke>
</function_calls>
```

Share code:
```
<function_calls>
<invoke name="code.snippet">
<parameter name="clientId">claude-desktop</parameter>
<parameter name="clientType">claude-code</parameter>
<parameter name="code">console.log('Hello from Claude Desktop!');</parameter>
<parameter name="language">javascript</parameter>
<parameter name="fileName">test.js</parameter>
<parameter name="description">A test snippet to verify sync</parameter>
</invoke>
</function_calls>
```

### Cursor

In Cursor, you can use the MCP command palette (Cmd+Shift+P, then type "MCP" and select "Run MCP Tool") to access these same tools and verify the bidirectional syncing.

## Development

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Generate Cloudflare Worker types: `npm run cf-typegen`

### Commands

- `npm run dev`: Start local development server
- `npm run deploy`: Deploy to Cloudflare Workers
- `npm run format`: Format code with Biome
- `npm run lint:fix`: Lint code with Biome

## Connect to Cursor and Claude Desktop

### Cursor

In Cursor, you can configure the MCP integration in your Cursor settings:

1. Open Cursor
2. Go to Settings > MCP Configuration
3. Add a new MCP server with URL `http://localhost:8787/sse` (for development) or your deployed Cloudflare Worker URL

### Claude Desktop

Configure Claude Desktop to connect to your MCP server:

1. Open Claude Desktop
2. Go to Settings > Developer > Edit Config
3. Update with this configuration:

```json
{
  "mcpServers": {
    "claudeCursorSync": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse"  // or your-worker.your-account.workers.dev/sse
      ]
    }
  }
}
```

## License

Copyright © 2024. All rights reserved.