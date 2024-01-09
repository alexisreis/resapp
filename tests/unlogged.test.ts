import { test, expect } from '@playwright/test';

/**
 * Test that an unlogged user is redirected to the login page whatever the url
 */
test('User not connected returns to the login page', async ({ page }) => {
    // Clear authentication cookies before
    await page.context().clearCookies();

    await page.goto('/');
    await expect(page).toHaveURL(/.*login/);

    await page.goto('/bookings');
    await expect(page).toHaveURL(/.*login/);

    await page.goto('/admin');
    await expect(page).toHaveURL(/.*login/);

});


