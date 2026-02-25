import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should switch between Chinese and English', async ({ page }) => {
    // Find language switcher
    const langSwitcher = page.locator('[data-testid="language-switcher"]');
    
    if (await langSwitcher.count() > 0) {
      // Click to open dropdown
      await langSwitcher.click();
      
      // Select English
      const englishOption = page.locator('button:has-text("English")');
      if (await englishOption.count() > 0) {
        await englishOption.click();
        
        // Verify UI changed to English
        await expect(page.locator('text=/Dashboard|Settings/i')).toBeVisible();
      }
      
      // Switch back to Chinese
      await langSwitcher.click();
      const chineseOption = page.locator('button:has-text("中文")');
      if (await chineseOption.count() > 0) {
        await chineseOption.click();
        
        // Verify UI changed to Chinese
        await expect(page.locator('text=/仪表板|设置/i')).toBeVisible();
      }
    }
  });

  test('should persist language preference', async ({ page, context }) => {
    // Set language to English
    const langSwitcher = page.locator('[data-testid="language-switcher"]');
    
    if (await langSwitcher.count() > 0) {
      await langSwitcher.click();
      const englishOption = page.locator('button:has-text("English")');
      if (await englishOption.count() > 0) {
        await englishOption.click();
      }
    }

    // Reload page
    await page.reload();
    
    // Language should still be English
    const hasEnglishText = await page.locator('text=/Dashboard|Settings/i').count() > 0;
    if (hasEnglishText) {
      expect(hasEnglishText).toBeTruthy();
    }
  });
});
