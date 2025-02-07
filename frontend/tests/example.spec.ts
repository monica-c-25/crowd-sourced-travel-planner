import { test, expect } from '@playwright/test';

// Test Homepage
// Assumptions: User is NOT logged in
test.describe("Home Page", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("http://localhost:3000")
  });

  test('Should have correct elements', async ({ page }) => {
    await expect(page).toHaveTitle("OwlWays Travel");
    await expect(page.getByRole("heading", {
      name: "Your destination awaits.",
    })).toBeVisible();
    await Promise.all([
      expect(page.getByRole("link", { name: "Explore" })).toBeVisible(),
      expect(page.getByRole("link", { name: "About Us" })).toBeVisible(),
      expect(page.getByRole("button", { name: "Login" })).toBeVisible()
    ]);
  });

  test('Explore Link: Should redirect to Explore page on click', async ({ page }) => {
    await page.getByRole("link", { name: "Explore" }).click();
    await expect(page.getByRole("heading", { name: "Explore Experiences"})).toBeVisible();
  });

  test('About Us Link: Should redirect to About us Page on click', async ({ page }) => {
    await page.getByRole("link", { name: "About Us" }).click();
    await expect(page.getByRole("heading", { name: "About Us" })).toBeVisible();
  });

  test('Login/Logut Button', async ({ page }) => {
    const userInfo = page.locator('.user-info');
    const userLoggedIn = await userInfo.isVisible();
    if (!userLoggedIn) {
      await page.getByRole("button", { name: "Login" }).click();
      await expect(page).toHaveTitle("Log in | travel-planner");
      await page.fill('#username', 'tester123@testmail.com');
      await page.fill('#password', 'Test123!');
      await page.locator('button:text("Continue")').click();
      // This is to get text that only says "Continue" and nothing else
      await expect(page.getByRole("heading", { name: "Your destination awaits."})).toBeVisible();
    } 
      await expect(userInfo).toBeVisible();
      await userInfo.click();
      await expect(page.locator('.dropdown-menu')).toBeVisible();
      await expect(page.locator('.logout-btn')).toBeVisible();
      await page.locator('.logout-btn').click();
      await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });
}); 

// Explore page
// Assumptions: Database has Experiences
test.describe("Explore Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/explore")
  });

  test('Should have correct elements', async ({ page }) => {
    await expect(page.getByRole('heading', { name: "Explore Experiences" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add New Experience" })).toBeVisible();
    await page.waitForSelector('.experience-card');
    await expect(page.locator('.experience-card').first()).toBeVisible();
  });

  test('Add Button: Should redirect to Experience form when clicked', async ({ page }) => {
    await page.getByRole("button", { name: "Add New Experience" }).click();
    await expect(page.locator('form:has-text("Share your experience")')).toBeVisible();
  })

  // Test clicking experience card once implemented
});
