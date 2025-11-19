import { test, expect, request } from '@playwright/test';

test.describe('API Endpoints', () => {
  let apiRequest: ReturnType<typeof request.newContext>;

  test.beforeEach(async () => {
    apiRequest = await request.newContext({
      baseURL: 'http://localhost:3000',
    });
  });

  test.afterEach(async () => {
    await apiRequest.dispose();
  });

  test.describe('Browser Agent API', () => {
    test('should return 200 for valid browser agent request', async () => {
      const response = await apiRequest.post('/api/browser-agent', {
        data: {
          userQuery: 'Navigate to google.com and take a screenshot',
        },
      });

      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('plan');
      expect(responseData).toHaveProperty('result');
      expect(responseData).toHaveProperty('timestamp');
    });

    test('should handle empty user query', async () => {
      const response = await apiRequest.post('/api/browser-agent', {
        data: {
          userQuery: '',
        },
      });

      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('plan');
      expect(responseData).toHaveProperty('result');
    });

    test('should handle user query with session ID', async () => {
      const response = await apiRequest.post('/api/browser-agent', {
        data: {
          userQuery: 'Click on the search button',
          sessionId: 'test-session-123',
        },
      });

      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('plan');
      expect(responseData).toHaveProperty('result');
      expect(responseData).toHaveProperty('timestamp');
    });

    test('should return 404 for non-existent endpoint', async () => {
      const response = await apiRequest.post('/api/nonexistent', {
        data: { userQuery: 'test' },
      });

      expect(response.status()).toBe(404);
    });
  });

  test.describe('MCP Control API', () => {
    test('should return 200 for MCP initialization', async () => {
      const response = await apiRequest.post('/api/mcp-control', {
        data: {
          action: 'initialize',
          options: {
            serverName: 'chrome-devtools',
            port: 3002,
          },
        },
      });

      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('success');
      expect(responseData).toHaveProperty('message');
    });

    test('should return server status', async () => {
      const response = await apiRequest.get('/api/mcp-control');
      
      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('server');
      expect(responseData).toHaveProperty('tools');
    });

    test('should handle MCP cleanup', async () => {
      const response = await apiRequest.post('/api/mcp-control', {
        data: {
          action: 'cleanup',
        },
      });

      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('success');
      expect(responseData).toHaveProperty('message');
    });

    test('should execute tool actions', async () => {
      const response = await apiRequest.post('/api/mcp-control', {
        data: {
          action: 'executeTool',
          toolName: 'navigate',
          parameters: {
            url: 'https://example.com',
          },
        },
      });

      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('success');
      expect(responseData).toHaveProperty('result');
    });

    test('should return 400 for invalid action', async () => {
      const response = await apiRequest.post('/api/mcp-control', {
        data: {
          action: 'invalid-action',
        },
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await apiRequest.post('/api/browser-agent', {
        data: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Should return 400 or 500 for malformed JSON
      expect([400, 500]).toContain(response.status());
    });

    test('should handle missing request body', async () => {
      const response = await apiRequest.post('/api/browser-agent');
      
      expect(response.status()).toBe(400);
    });

    test('should handle CORS preflight requests', async () => {
      const response = await apiRequest.options('/api/browser-agent');
      
      expect(response.status()).toBe(204);
    });
  });

  test.describe('Response Headers', () => {
    test('should include CORS headers', async () => {
      const response = await apiRequest.post('/api/browser-agent', {
        data: { userQuery: 'test' },
      });

      expect(response.headers()['access-control-allow-origin']).toBe('*');
      expect(response.headers()['access-control-allow-methods']).toContain('POST');
      expect(response.headers()['access-control-allow-headers']).toContain('content-type');
    });

    test('should set proper content type', async () => {
      const response = await apiRequest.post('/api/browser-agent', {
        data: { userQuery: 'test' },
      });

      expect(response.headers()['content-type']).toContain('application/json');
    });
  });
});