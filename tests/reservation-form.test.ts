import {test, expect} from '@playwright/test';

/**
 * Checks the AddReservationForm behavior
 */
test.describe('Reservation form', () => {
    // Require the user access token
    test.use({storageState: './auth-user.json'});

    /**
     * Checks that the form is functional, request resources, book a machine then checks that the reservation
     * is displayed in the calendar and in the bookings page
     */
    test('[User] Fill the form', async ({page}) => {
        await page.goto('/');

        const popupContainer = page.locator("div[class='popup-container']");
        await expect(popupContainer).not.toBeVisible();

        const errorPopup = popupContainer.locator("div[class='error-popup']");
        await expect(errorPopup).not.toBeVisible();

        const addReservationButton = page.locator("button[title='Add a reservation']");
        await addReservationButton.click();

        // Checks that the popup-container is visible after clicking the button
        await expect(popupContainer).toBeVisible();

        // Checks that the form is visible
        const form = popupContainer.locator("form");
        await expect(form).toBeVisible();

        // STEP 1 : Checks that the form is functional
        // We're asking for a machine for 2 hours, tomorrow between 9:00 and 17:00 with 4CPU, 16GB RAM and 24GB GPU RAM

        // begin_date
        const beginDateInput = form.locator("input[name='begin_date']");
        // Fills the begin date input with tomorrow's date at 9:00
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(11, 0, 0, 0);
        await beginDateInput.fill(tomorrow.toISOString().slice(0, 16));

        const endDateInput = form.locator("input[name='ending_date']");
        // Fills the end date input with tomorrow's date at 17:00
        tomorrow.setHours(19, 0, 0, 0);
        await endDateInput.fill(tomorrow.toISOString().slice(0, 16));

        const durationInput = form.locator("input[name='duration']");
        await durationInput.fill("2");

        const cpuInput = form.locator("input[name='nb_cpu']");
        await cpuInput.fill("4");

        const ramInput = form.locator("input[name='ram_gb']");
        await ramInput.fill("16");

        const gpuInput = form.locator("input[name='gpu_ram_gb']");
        await page.check('input[name="has_gpu"][value="has_gpu_true"]');
        await gpuInput.fill("24");

        const taskNameInput = form.locator("input[name='task_name']");
        await taskNameInput.fill("Test task");

        const submitButton = form.locator("button[type='submit']");
        await submitButton.click();
        await expect(errorPopup).not.toBeVisible();


        // STEP 2 : Checks that the service provides available slots for this request
        const clickableHour = form.locator("button[title='Click to see available slots at 10:00']");
        await expect(clickableHour).toBeVisible();
        await clickableHour.click();

        // Takes the first available machine displayed
        const bookableMachine = form.locator("div[class='book-machine']").nth(0);
        await expect(bookableMachine).toBeVisible();

        // Books it
        const bookMachineButton = bookableMachine.locator("button");
        await expect(bookMachineButton).toBeVisible();
        await bookMachineButton.click();


        // Checks that the popup-container is not visible after clicking the submit button
        await expect(popupContainer).not.toBeVisible();


        // STEP 3 : Checks that the reservation is displayed in the calendar
        const reservationDetails = page.locator("div[class='event-content']");
        await expect(reservationDetails).not.toBeVisible();
        const reservation = page.locator("div[class='rbc-event-content'][title='user | Test task']").nth(0);
        await expect(reservation).toBeVisible();
        await reservation.click();

        // Checks that the reservation details are displayed
        await expect(reservationDetails).toBeVisible();

        // Checks that the reservation details are correct
        const reservationDetailsText = await reservationDetails.locator("span[class='reservation-title']");
        await expect(reservationDetailsText).toHaveText("Test task");
        await expect(reservationDetailsText).toBeVisible();

        const deleteButton = reservationDetails.locator("button[title='Delete this reservation']");
        await expect(deleteButton).toBeVisible();

        const closeButton = reservationDetails.locator("button[title='Close']");
        await expect(closeButton).toBeVisible();
        await closeButton.click();

        // Checks that the reservation details are not visible anymore
        await expect(reservationDetails).not.toBeVisible();


        // STEP 4 : Checks that the reservation is displayed in the bookings page
        await page.locator("a[href='/bookings']").click();
        await expect(page).toHaveURL(/.*bookings/);

        const booking = page.locator("div[class='reservation-div ']").nth(0);
        await expect(booking).toBeVisible();

        const bookingName = await booking.locator(".reservation-title").nth(0);
        await expect(bookingName).toHaveText("Test task");


        // Once all the test pass, delete the reservation here
        page.on('dialog', async (dialog) => {
            expect(dialog.message()).toEqual('Are you sure you want to delete this reservation?')
            await dialog.accept()
        })

        const deleteBookingButton = booking.locator("button[title='Delete this reservation']");
        await expect(deleteBookingButton).toBeVisible();
        await deleteBookingButton.click();


        // Then expect not to find it in the Bookings
        await expect(booking).not.toBeVisible();

        const noBookingText = page.locator('.App p');
        await expect(noBookingText.nth(0)).toHaveText("You have no next bookings");
        await expect(noBookingText.nth(1)).toHaveText("You have no past bookings");

        // Nor in the calendar
        await page.getByRole('link', { name: 'Calendar' }).click();
        await expect(page).toHaveURL('/');
        await expect(reservation).not.toBeVisible();

    })
});