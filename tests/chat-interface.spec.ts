import { test, expect } from '@playwright/test';

test.describe('Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the main page', async ({ page }) => {
    await expect(page).toHaveTitle(/Agentic Chatbot/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display the chat interface', async ({ page }) => {
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="send-button"]')).toBeVisible();
  });

  test('should allow typing in the chat input', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    await messageInput.click();
    await messageInput.fill('Hello, this is a test message');
    await expect(messageInput).toHaveValue('Hello, this is a test message');
  });

  test('should send a message when button is clicked', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    await messageInput.fill('Test message');
    await sendButton.click();
    
    // Wait for the message to appear in the chat
    await expect(page.locator('.message-content')).toContainText('Test message');
  });

  test('should handle enter key to send messages', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    
    await messageInput.fill('Test message with enter key');
    await messageInput.press('Enter');
    
    // Wait for the message to appear
    await expect(page.locator('.message-content')).toContainText('Test message with enter key');
  });

  test('should show typing indicator', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    await messageInput.fill('Testing typing indicator');
    await sendButton.click();
    
    // Check for typing indicator
    await expect(page.locator('.typing-indicator')).toBeVisible();
  });

  test('should display VNC viewer when toggle is enabled', async ({ page }) => {
    const vncToggle = page.locator('[data-testid="vnc-toggle"]');
    await vncToggle.click();
    
    await expect(page.locator('[data-testid="vnc-viewer"]')).toBeVisible();
  });

  test('should handle multiple messages', async ({ page }) => {
    const messages = ['Message 1', 'Message 2', 'Message 3'];
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    for (const message of messages) {
      await messageInput.fill(message);
      await sendButton.click();
      await page.waitForTimeout(500); // Small delay between messages
    }
    
    // Check all messages are displayed
    for (const message of messages) {
      await expect(page.locator('.message-content')).toContainText(message);
    }
  });

  test('should respect responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
  });
});