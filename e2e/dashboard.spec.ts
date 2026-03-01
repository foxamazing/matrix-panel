import { test, expect } from '@playwright/test';

test.describe('Dashboard Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load dashboard successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Matrix Panel/i);
    await expect(page.locator('h1, h2')).toContainText(/Matrix Panel|Dashboard/i);
  });

  test('should display widgets', async ({ page }) => {
    // Wait for widgets to load
    await page.waitForSelector('[data-testid="widget"]', { timeout: 10000 });
    
    // Check if at least one widget is visible
    const widgets = page.locator('[data-testid="widget"]');
    await expect(widgets.first()).toBeVisible();
  });

  test('should toggle edit mode', async ({ page }) => {
    // Find and click edit mode button
    const editButton = page.locator('button:has-text("编辑"), button:has-text("Edit")');
    if (await editButton.count() > 0) {
      await editButton.first().click();
      
      // Verify edit mode is active
      await expect(page.locator('[data-testid="edit-mode"]')).toBeVisible();
    }
  });

  test('should open widget settings', async ({ page }) => {
    // Enter edit mode first
    const editButton = page.locator('button:has-text("编辑"), button:has-text("Edit")');
    if (await editButton.count() > 0) {
      await editButton.first().click();
      await page.waitForTimeout(500);
    }

    // Click on a widget settings icon
    const settingsIcon = page.locator('[data-testid="widget-settings"]').first();
    if (await settingsIcon.count() > 0) {
      await settingsIcon.click();
      
      // Verify settings modal is open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    }
  });

  test('should add new widget', async ({ page }) => {
    // Enter edit mode
    const editButton = page.locator('button:has-text("编辑"), button:has-text("Edit")');
    if (await editButton.count() > 0) {
      await editButton.first().click();
    }

    // Click add widget button
    const addButton = page.locator('button:has-text("添加"), button:has-text("Add Widget")');
    if (await addButton.count() > 0) {
      await addButton.first().click();
      
      // Verify widget picker is shown
      await expect(page.locator('[data-testid="widget-picker"]')).toBeVisible();
    }
  });
});
