import { test, expect } from '@playwright/test';

/**
 * Checks that the login page is displayed correctly
 */
test.describe("Login page", () => {
    test('Login page display', async ({ page }) => {
        await page.goto('/');

        // Expect the page title to be "Resource Reservation App"
        await expect(page).toHaveTitle("Resource Reservation App");

        // Expect to go to /login
        await expect(page).toHaveURL(/.*login/);


        // Expect the login form to be visible
        let title = page.locator("h1");
        let usernameInput = page.locator("input[type='text']");
        let passwordInput = page.locator("input[type='password']");
        let submitButton = page.locator("input[type='submit']");

        await expect(title).toBeVisible();
        await expect(usernameInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(submitButton).toBeVisible();

        // Expect the login form to be empty
        await expect(usernameInput).toHaveValue("");
        await expect(passwordInput).toHaveValue("");

        await expect(submitButton).toContainText("Login");
    });
})
