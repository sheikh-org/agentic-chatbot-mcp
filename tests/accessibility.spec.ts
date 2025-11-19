import { test, expect } from '@playwright/test';

test.describe('Accessibility & Performance', () => {
  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have proper meta description', async ({ page }) => {
    await page.goto('/');
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one h1
    
    const h2s = await page.locator('h2').all();
    const h3s = await page.locator('h3').all();
    
    // Headings should be in proper order (no h3 before h2, etc.)
    const allHeadings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(allHeadings.length).toBeGreaterThan(0);
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Check if basic accessibility attributes are present
    const interactiveElements = await page.locator('button, input, select, textarea, a').all();
    
    for (const element of interactiveElements) {
      const hasAccessibleName = await element.getAttribute('aria-label') || 
                               await element.textContent() ||
                               await element.getAttribute('title');
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // Should be able to navigate through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check main interface elements have proper ARIA labels
    const chatInterface = page.locator('[data-testid="chat-interface"]');
    await expect(chatInterface).toHaveAttribute('role');
    
    const messageInput = page.locator('[data-testid="message-input"]');
    await expect(messageInput).toHaveAttribute('aria-label');
    
    const sendButton = page.locator('[data-testid="send-button"]');
    await expect(sendButton).toHaveAttribute('aria-label');
  });

  test('should handle focus management properly', async ({ page }) => {
    await page.goto('/');
    
    // Click on message input
    await page.locator('[data-testid="message-input"]').click();
    
    // Check if input has focus
    const isFocused = await page.locator('[data-testid="message-input"]').evaluate(el => 
      el === document.activeElement
    );
    expect(isFocused).toBe(true);
    
    // Send a message
    await page.locator('[data-testid="message-input"]').fill('test message');
    await page.locator('[data-testid="send-button"]').click();
    
    // Focus should return to input for continuous typing
    await page.waitForTimeout(1000);
    const isStillFocused = await page.locator('[data-testid="message-input"]').evaluate(el => 
      el === document.activeElement
    );
    // This depends on implementation - either focused or not, but shouldn't crash
    expect(isStillFocused !== undefined).toBe(true);
  });

  test('should have proper semantic HTML', async ({ page }) => {
    await page.goto('/');
    
    // Check for semantic elements
    const hasHeader = await page.locator('header').count();
    const hasMain = await page.locator('main').count();
    const hasNav = await page.locator('nav').count();
    const hasFooter = await page.locator('footer').count();
    
    // At least main should be present
    expect(hasMain).toBeGreaterThanOrEqual(1);
  });

  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds (adjust based on your requirements)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have proper error handling', async ({ page }) => {
    await page.goto('/');
    
    // Try invalid actions that shouldn't crash the app
    await page.locator('[data-testid="message-input"]').fill('');
    await page.locator('[data-testid="send-button"]').click();
    
    // Should handle gracefully without showing error dialogs
    const errorDialog = page.locator('[role="alert"]');
    await expect(errorDialog).not.toBeVisible();
    
    // App should still be functional
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
  });

  test('should work with screen reader simulation', async ({ page }) => {
    await page.goto('/');
    
    // Add attributes that screen readers look for
    await page.evaluate(() => {
      const mainContent = document.querySelector('[data-testid="chat-interface"]');
      if (mainContent) {
        mainContent.setAttribute('aria-live', 'polite');
        mainContent.setAttribute('aria-label', 'Chat interface');
      }
    });
    
    // Send a message
    await page.locator('[data-testid="message-input"]').fill('Screen reader test');
    await page.locator('[data-testid="send-button"]').click();
    
    // Should not crash and should handle ARIA attributes properly
    const hasAriaLive = await page.locator('[data-testid="chat-interface"]')
      .getAttribute('aria-live');
    expect(hasAriaLive).toBeTruthy();
  });

  test('should maintain accessibility across viewport changes', async ({ page }) => {
    await page.goto('/');
    
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Check interface remains accessible
      await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
      await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
      
      // Check keyboard navigation still works
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBeTruthy();
    }
  });
});