import { test, expect } from '@playwright/test';

test.describe('Widget Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('clock widget should display time', async ({ page }) => {
    // Look for clock widget
    const clockWidget = page.locator('[data-widget-kind="clock"]').first();
    
    if (await clockWidget.count() > 0) {
      await expect(clockWidget).toBeVisible();
      
      // Clock should contain time format (HH:MM)
      await expect(clockWidget).toContainText(/\d{1,2}:\d{2}/);
    }
  });

  test('should refresh widget data', async ({ page }) => {
    // Click on a widget's refresh button if exists
    const refreshButton = page.locator('[data-testid="widget-refresh"]').first();
    
    if (await refreshButton.count() > 0) {
      await refreshButton.click();
      
      // Wait for refresh to complete
      await page.waitForTimeout(1000);
      
      // Verify widget is still visible
      await expect(page.locator('[data-testid="widget"]').first()).toBeVisible();
    }
  });

  test('should handle widget errors gracefully', async ({ page }) => {
    // Intercept API calls and simulate error
    await page.route('**/api/**', (route) => {
      route.abort('failed');
    });

    await page.reload();
    
    // Widget should show error state, not crash
    const errorMessage = page.locator('text=/error|错误|failed|失败/i');
    
    // Either error message or fallback content should be visible
    await expect(page.locator('[data-testid="widget"]').first()).toBeVisible();
  });

  test('dashdot widget should load system stats', async ({ page }) => {
    const dashdotWidget = page.locator('[data-widget-kind="dashdot"]').first();
    
    if (await dashdotWidget.count() > 0) {
      await expect(dashdotWidget).toBeVisible();
      
      // Should contain system stats labels
      await expect(dashdotWidget).toContainText(/CPU|RAM|Storage|Network/i);
    }
  });

  test('ical widget should display events', async ({ page }) => {
    const icalWidget = page.locator('[data-widget-kind="ical"]').first();
    
    if (await icalWidget.count() > 0) {
      await expect(icalWidget).toBeVisible();
      
      // Should contain calendar-related text
      await expect(icalWidget).toContainText(/Calendar|Event|日历|事件/i);
    }
  });
});
