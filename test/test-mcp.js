#!/usr/bin/env node

/**
 * Basic test script for Claude-Cursor Sync Bridge MCP server
 * Tests task creation, querying, and code snippet sharing
 */

const fetch = require('node-fetch');

const BASE_URL = 'https://claude-cursor-sync.half-dozen.workers.dev';
const TEST_CLIENT_ID = 'test-script';
const TEST_CLIENT_TYPE = 'node-client';

async function checkHealth() {
    console.log('🔍 Checking server health...');
    
    try {
        const response = await fetch(`${BASE_URL}/health`);
        const data = await response.json();
        
        console.log('✅ Health check successful:');
        console.log(JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        process.exit(1);
    }
}

async function callMcpTool(toolName, params) {
    console.log(`\n🔧 Calling tool: ${toolName}`);
    
    try {
        const response = await fetch(`${BASE_URL}/mcp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                request: {
                    type: 'function',
                    function: {
                        name: toolName,
                        arguments: params
                    }
                }
            }),
        });
        
        const data = await response.json();
        console.log(`✅ ${toolName} response:`);
        
        // Parse the text content, which is a stringified JSON
        try {
            const content = JSON.parse(data.response.content[0].text);
            console.log(JSON.stringify(content, null, 2));
            return content;
        } catch (e) {
            console.log(data.response.content[0].text);
            return data.response;
        }
    } catch (error) {
        console.error(`❌ ${toolName} call failed:`, error.message);
        return null;
    }
}

async function runTests() {
    // Step 1: Check server health
    const healthData = await checkHealth();
    
    if (healthData.phase !== '2') {
        console.log('⚠️ Server is not in Phase 2, some tests may fail');
    }
    
    // Step 2: Create a test task
    const taskResult = await callMcpTool('task_create', {
        clientId: TEST_CLIENT_ID,
        clientType: TEST_CLIENT_TYPE,
        title: 'Test Task from Test Script',
        description: 'This is a test task created via the test script',
        status: 'pending',
        priority: 'high',
        tags: ['test', 'automation']
    });
    
    if (!taskResult || !taskResult.success) {
        console.error('❌ Task creation failed, cannot continue tests');
        process.exit(1);
    }
    
    const taskId = taskResult.task.id;
    console.log(`📝 Created task with ID: ${taskId}`);
    
    // Step 3: Query tasks
    const queryResult = await callMcpTool('task_query', {
        clientId: TEST_CLIENT_ID,
        clientType: TEST_CLIENT_TYPE,
    });
    
    if (!queryResult || !queryResult.success) {
        console.error('❌ Task querying failed');
    } else {
        console.log(`📋 Found ${queryResult.tasks.length} tasks`);
    }
    
    // Step 4: Update task status
    const updateResult = await callMcpTool('task_status_update', {
        clientId: TEST_CLIENT_ID,
        clientType: TEST_CLIENT_TYPE,
        taskId: taskId,
        status: 'in-progress'
    });
    
    if (!updateResult || !updateResult.success) {
        console.error('❌ Task status update failed');
    } else {
        console.log(`📝 Updated task status to: ${updateResult.task.status}`);
    }
    
    // Step 5: Share a code snippet
    const snippetResult = await callMcpTool('code_snippet', {
        clientId: TEST_CLIENT_ID,
        clientType: TEST_CLIENT_TYPE,
        code: 'console.log("Hello from test script!");',
        language: 'javascript',
        fileName: 'test-script.js',
        description: 'A test snippet from the test script',
        taskId: taskId
    });
    
    if (!snippetResult || !snippetResult.success) {
        console.error('❌ Code snippet sharing failed');
    } else {
        console.log(`💻 Shared code snippet with ID: ${snippetResult.snippet.id}`);
    }
    
    // Step 6: Add implementation details
    const detailsResult = await callMcpTool('implementation_details', {
        clientId: TEST_CLIENT_ID,
        clientType: TEST_CLIENT_TYPE,
        taskId: taskId,
        details: 'Implementation will use the test script approach',
        status: 'planning'
    });
    
    if (!detailsResult || !detailsResult.success) {
        console.error('❌ Adding implementation details failed');
    } else {
        console.log(`🔍 Added implementation details to task`);
    }
    
    // Step 7: Broadcast a message
    const messageResult = await callMcpTool('message_broadcast', {
        clientId: TEST_CLIENT_ID,
        clientType: TEST_CLIENT_TYPE,
        message: 'Hello from the test script!',
        taskId: taskId
    });
    
    if (!messageResult || !messageResult.success) {
        console.error('❌ Message broadcast failed');
    } else {
        console.log(`💬 Broadcast message with ID: ${messageResult.result.id}`);
    }
    
    console.log('\n✅ All tests completed!');
}

// Run the tests
runTests().catch(err => {
    console.error('❌ Test execution failed:', err);
    process.exit(1);
});