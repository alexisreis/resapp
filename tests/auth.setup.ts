import { test as setup, expect } from '@playwright/test';

const userFile = './auth-user.json';
const adminFile = './auth-admin.json';

/**
 * User authentication using the login form
 * Stores the access tokens in userFile
 */
setup('authenticate as user', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');

    // Expect to go to /login
    await expect(page).toHaveURL(/.*login/);

    let usernameInput = page.locator("input[type='text']");
    let passwordInput = page.locator("input[type='password']");
    let submitButton = page.locator("input[type='submit']");

    // Fill in the login form
    await usernameInput.click();
    await usernameInput.fill('');
    await usernameInput.click();
    await usernameInput.fill('user');

    await passwordInput.click();
    await passwordInput.fill('');
    await passwordInput.click();
    await passwordInput.fill('user');

    // Submit the login form
    await submitButton.click();

    // Wait for / (homepage)
    await page.waitForURL('/');
    await expect(page).not.toHaveURL(/.*login/);
    await expect(page).toHaveURL('/');

    await page.context().storageState({ path: userFile });
});


/**
 * Admin authentication using the login form
 * Stores the access tokens in adminFile
 */
setup('authenticate as admin', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');

    // Expect to go to /login
    await expect(page).toHaveURL(/.*login/);

    let usernameInput = page.locator("input[type='text']");
    let passwordInput = page.locator("input[type='password']");
    let submitButton = page.locator("input[type='submit']");

    // Fill in the login form
    await usernameInput.click();
    await usernameInput.fill('');
    await usernameInput.click();
    await usernameInput.fill('admin');

    await passwordInput.click();
    await passwordInput.fill('');
    await passwordInput.click();
    await passwordInput.fill('admin');

    // Submit the login form
    await submitButton.click();

    // Wait for / (homepage)
    await page.waitForURL('/');
    await expect(page).not.toHaveURL(/.*login/);
    await expect(page).toHaveURL('/');

    // End of authentication steps.
    await page.context().storageState({ path: adminFile });
});

