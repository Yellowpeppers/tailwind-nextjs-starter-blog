import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load the homepage and display the title', async ({ page }) => {
    await page.goto('/')

    // Expect the page to have the correct title "NeuroHacks Lab"
    await expect(page).toHaveTitle(/NeuroHacks Lab/i)

    // Check for main heading
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })

  test('should have visible navigation links', async ({ page, isMobile }) => {
    await page.goto('/')

    if (isMobile) {
      // On mobile, find the hamburger menu button
      // Using a more specific locator to ensure we find the right button
      const toggleBtn = page.locator('button[aria-label="Toggle Menu"]')
      await expect(toggleBtn).toBeVisible({ timeout: 20000 })
    } else {
      // On desktop, check for "Focus Lab" which we know exists in headerNavLinks.ts
      // (The visible one, not the mobile one which is hidden)
      const focusLabLink = page.getByRole('link', { name: 'Focus Lab' }).first()
      await expect(focusLabLink).toBeVisible()
      // Also verify "Guides" is visible (formerly Blog)
      const guidesLink = page.getByRole('link', { name: 'Guides' }).first()
      await expect(guidesLink).toBeVisible()
    }
  })

  test('visual regression test', async ({ page }) => {
    await page.goto('/')

    // Check for main heading to ensure page is loaded before taking screenshot
    await expect(page.locator('h1').first()).toBeVisible()

    // Capture a screenshot
    await expect(page).toHaveScreenshot({ fullPage: true })
  })
})
