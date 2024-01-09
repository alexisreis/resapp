import { test, expect } from '@playwright/test';


/**
 * Checks the structure of the homepage for a non-admin user
 */
test.describe('[User] Homepage', () => {

    // Require the user access token
    test.use({storageState: './auth-user.json'});

    /**
     * Checks that the homepage is displayed correctly for an admin user
     */
    test('[User] Display the homepage', async ({ page }) => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/.*login/);

        const navbar = page.locator("nav");
        await expect(navbar).toBeVisible();
        await expect(navbar).toContainText("Resapp");
        await expect(navbar.getByRole('link', { name: 'Calendar' })).toBeVisible();
        await expect(navbar.getByRole('link', { name: 'My bookings' })).toBeVisible();
        await expect(navbar.getByRole('link', { name: 'Admin dashboard' })).not.toBeVisible();

        await expect(navbar).toContainText("user");
        await expect(navbar.locator("a[title='Sign-out']")).toBeVisible();


        const calendarHeader = page.locator("div[class='calendar-header']");
        const addReservationButton = calendarHeader.locator("button[title='Add a reservation']");
        await expect(calendarHeader).toBeVisible();
        await expect(addReservationButton).toBeVisible();


        const calendarContainer = page.locator("div[class='calendar-container']");
        await expect(calendarContainer).toBeVisible();
    });

    /**
     * Checks that the "My bookings" link is functional
     */
    test('[User] Go to bookings page', async ({ page }) => {
        await page.goto('/');

        const navbar = page.locator("nav");
        const booking_link = navbar.getByRole('link', { name: 'My bookings' });
        await booking_link.click();

        await expect(page).toHaveURL(/.*bookings/);
    });

    /**
     * Checks that a non-admin user cannot access the /admin page
     */
    test('[User] Go to admin page', async ({ page }) => {
        await page.goto('/admin');
        await expect(page).toHaveURL("/");
    });

    /**
     * Checks that the "Add a reservation" button is functional
     * and that the form is displayed correctly (fields, buttons, ...)
     * TODO: check that the form is functional
     */
    test('[User] Add a reservation button', async ({ page }) => {
        await page.goto('/');

        // Checks that there is no popup-container before clicking the button
        const popupContainer = page.locator("div[class='popup-container']");
        await expect(popupContainer).not.toBeVisible();

        const calendarHeader = page.locator("div[class='calendar-header']");
        const addReservationButton = calendarHeader.locator("button[title='Add a reservation']");
        await addReservationButton.click();

        // Checks that the popup-container is visible after clicking the button
        await expect(popupContainer).toBeVisible();

        // Checks that the form is visible
        const form = popupContainer.locator("form");
        await expect(form).toBeVisible();

        // Checks that the form contains the right fields
        const formTitle = form.getByRole('heading', { name: 'Request resources' });
        await expect(formTitle).toBeVisible();

        const beginDateInput = form.locator("input[name='begin_date']");
        await expect(beginDateInput).toBeVisible();

        const endDateInput = form.locator("input[name='ending_date']");
        await expect(endDateInput).toBeVisible();

        const durationInput = form.locator("input[name='duration']");
        await expect(durationInput).toBeVisible();

        const cpuInput = form.locator("input[name='nb_cpu']");
        await expect(cpuInput).toBeVisible();

        const ramInput = form.locator("input[name='ram_gb']");
        await expect(ramInput).toBeVisible();

        // @ts-ignore
        const selectedGPUValue = await page.$eval('input[name="has_gpu"]:checked', el => el.value);
        await expect(selectedGPUValue).toBe("has_gpu_false");

        const gpuInput = form.locator("input[name='gpu_ram_gb']");
        await expect(gpuInput).not.toBeVisible();

        await page.check('input[name="has_gpu"][value="has_gpu_true"]');
        await expect(gpuInput).toBeVisible();

        const taskNameInput = form.locator("input[name='task_name']");
        await expect(taskNameInput).toBeVisible();


        const errorPopup = popupContainer.locator("div[class='error-popup']");
        await expect(errorPopup).not.toBeVisible();

        const submitButton = form.locator("button[type='submit']");
        await expect(submitButton).toBeVisible();
        await submitButton.click();
        await expect(errorPopup).toBeVisible();


        const cancelButton = form.locator("button[class='cancel-button']");
        await expect(cancelButton).toBeVisible();
        await cancelButton.click();

        // Checks that the popup-container is not visible after clicking the cancel button
        await expect(popupContainer).not.toBeVisible();
    });

});


/**
 * Checks the structure of the homepage for an admin user
 */
test.describe('[Admin] Homepage', () => {

    // Require the admin access token
    test.use({storageState: './auth-admin.json'});

    /**
     * Checks that the homepage is displayed correctly for an admin user
     */
    test('[Admin] Display the homepage', async ({ page }) => {

        await page.goto('/');
        await expect(page).not.toHaveURL(/.*login/);

        const navbar = page.locator("nav");
        await expect(navbar).toBeVisible();
        await expect(navbar).toContainText("Resapp");
        await expect(navbar.getByRole('link', { name: 'Calendar' })).toBeVisible();
        await expect(navbar.getByRole('link', { name: 'My bookings' })).toBeVisible();
        await expect(navbar.getByRole('link', { name: 'Admin dashboard' })).toBeVisible();
        await expect(navbar.locator("a[title='Sign-out']")).toBeVisible();
        await expect(navbar).toContainText("admin");

        const calendarHeader = page.locator("div[class='calendar-header']");
        const addReservationButton = calendarHeader.locator("button[title='Add a reservation']");
        await expect(calendarHeader).toBeVisible();
        await expect(addReservationButton).toBeVisible();


        const calendarContainer = page.locator("div[class='calendar-container']");
        await expect(calendarContainer).toBeVisible();
    });

    /**
     * Checks that the "My bookings" link is functional
     */
    test('[Admin] Go to bookings page', async ({ page }) => {
        await page.goto('/');

        const navbar = page.locator("nav");
        const booking_link = navbar.getByRole('link', { name: 'My bookings' });
        await booking_link.click();

        await expect(page).toHaveURL(/.*bookings/);
    });

    /**
     * Checks that the "Admin dashboard" link is functional
     */
    test('[Admin] Go to admin page', async ({ page }) => {
        await page.goto('/');

        const navbar = page.locator("nav");
        const admin_link = navbar.getByRole('link', { name: 'Admin dashboard' });
        await admin_link.click();

        await expect(page).toHaveURL(/.*admin/);
    });
});


