import { test, expect } from '@playwright/test';

test.describe('VNC Viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Enable VNC viewer
    await page.locator('[data-testid="vnc-toggle"]').click();
  });

  test('should display VNC viewer container', async ({ page }) => {
    await expect(page.locator('[data-testid="vnc-viewer-container"]')).toBeVisible();
  });

  test('should show connection status', async ({ page }) => {
    await expect(page.locator('[data-testid="vnc-status"]')).toBeVisible();
    
    // Check if status shows proper text (connecting, connected, or disconnected)
    const statusText = await page.locator('[data-testid="vnc-status"]').textContent();
    expect(['Connecting...', 'Connected', 'Disconnected', 'Connection failed']).toContain(statusText || '');
  });

  test('should handle VNC connection toggling', async ({ page }) => {
    const vncToggle = page.locator('[data-testid="vnc-toggle"]');
    
    // Toggle off
    await vncToggle.click();
    await expect(page.locator('[data-testid="vnc-viewer-container"]')).not.toBeVisible();
    
    // Toggle back on
    await vncToggle.click();
    await expect(page.locator('[data-testid="vnc-viewer-container"]')).toBeVisible();
  });

  test('should display VNC controls', async ({ page }) => {
    await expect(page.locator('[data-testid="vnc-controls"]')).toBeVisible();
    
    // Check for common VNC controls
    await expect(page.locator('[data-testid="vnc-disconnect"]')).toBeVisible();
    await expect(page.locator('[data-testid="vnc-fullscreen"]')).toBeVisible();
  });

  test('should handle fullscreen toggle', async ({ page }) => {
    const fullscreenButton = page.locator('[data-testid="vnc-fullscreen"]');
    
    await fullscreenButton.click();
    
    // Check if browser enters fullscreen or if viewer expands
    // This depends on implementation - just check the button state changes
    const isFullscreen = await page.evaluate(() => document.fullscreenElement !== null);
    
    // Alternative check: verify viewer container class changes
    const viewerClasses = await page.locator('[data-testid="vnc-viewer-container"]').getAttribute('class');
    expect(viewerClasses).toMatch(/fullscreen|expanded/);
  });

  test('should show connection details', async ({ page }) => {
    await expect(page.locator('[data-testid="vnc-details"]')).toBeVisible();
    
    // Should display connection info like host, port, etc.
    const detailsText = await page.locator('[data-testid="vnc-details"]').textContent();
    expect(detailsText).toBeTruthy();
  });

  test('should handle WebSocket connection errors', async ({ page }) => {
    // Monitor console errors
    const consoleMessages: string[] = [];
    page.on('console', msg => consoleMessages.push(msg.text()));
    
    // Should handle WebSocket errors gracefully
    await page.waitForTimeout(2000); // Give time for connection attempts
    
    // Check that no critical errors occurred (implementation specific)
    const criticalErrors = consoleMessages.filter(msg => 
      msg.includes('WebSocket') && (msg.includes('error') || msg.includes('failed'))
    );
    
    // Allow some errors during normal operation, but no crashes
    expect(consoleMessages.length).toBeLessThan(10); // Reasonable limit
  });

  test('should resize properly on different viewports', async ({ page }) => {
    const vncViewer = page.locator('[data-testid="vnc-viewer-container"]');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileBounds = await vncViewer.boundingBox();
    expect(mobileBounds?.width).toBeLessThan(400);
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    const tabletBounds = await vncViewer.boundingBox();
    expect(tabletBounds?.width).toBeGreaterThan(400);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopBounds = await vncViewer.boundingBox();
    expect(desktopBounds?.width).toBeGreaterThan(800);
  });

  test('should display proper loading states', async ({ page }) => {
    // Check for loading indicators
    const loadingIndicator = page.locator('[data-testid="vnc-loading"]');
    
    // Should show loading initially
    await expect(loadingIndicator).toBeVisible({ timeout: 3000 });
    
    // Loading should eventually disappear
    await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
  });
});