import {test, expect} from '@playwright/test';

/**
 * Checks the admin dashboard functionalities
 */
test.describe('Admin dashboard', () => {
    // Require the user access token
    test.use({storageState: './auth-admin.json'});

    /**
     * Checks that the admin dashboard is displayed correctly
     */
    test('[Admin] Display the admin dashboard', async ({page}) => {
        await page.goto('/');

        await page.getByRole('link', {name: "Admin dashboard"}).click();
        await expect(page).toHaveURL(/.*admin/);

        // TABS
        const machines_tab = page.locator("button[title='Machines tab']");
        const stats_tab = page.locator("button[title='Statistics tab']");
        const users_tab = page.locator("button[title='Users tab']");

        await expect(machines_tab).toBeVisible();
        await expect(stats_tab).toBeVisible();
        await expect(users_tab).toBeVisible();

        // MACHINES TAB
        await machines_tab.click();
        const title = page.locator("h2").nth(1);
        await expect(title).toHaveText("Machines 💻");

        const addMachineButton = page.locator("button[title='Add a machine']");
        await expect(addMachineButton).toBeVisible();

        const machine_list = page.locator("table");
        await expect(machine_list).toBeVisible();

        // STATS TAB
        await stats_tab.click();
        await expect(title).toHaveText("Statistics 📊");
        await expect(machine_list).not.toBeVisible();

        // USERS TAB
        await users_tab.click();
        await expect(title).toHaveText("Users 👨‍💻");
        await expect(machine_list).toBeVisible();
        

        // Check that "Add a machine" button display the form
        await machines_tab.click();
        const popupContainer = page.locator("div[class='popup-container']");
        await expect(popupContainer).not.toBeVisible();

        const errorPopup = popupContainer.locator("div[class='error-popup']");
        await expect(errorPopup).not.toBeVisible();


        await addMachineButton.click();

        // Checks that the popup-container is visible after clicking the button
        await expect(popupContainer).toBeVisible();

        // Checks that the form is visible
        const form = popupContainer.locator("form");
        await expect(form).toBeVisible();

        const cancel_button = form.locator("button[class='cancel-button']");
        await expect(cancel_button).toBeVisible();
        await expect(cancel_button).toHaveText("Cancel");
        await cancel_button.click();

        await expect(popupContainer).not.toBeVisible();

        let table_count = await page.locator("table").count();
        await expect(table_count).toBe(1);

        const show_deleted_machines = page.locator("button[title='Show deleted machines']");
        await expect(show_deleted_machines).toBeVisible();
        await show_deleted_machines.click();

        table_count = await page.locator("table").count();
        await expect(table_count).toBe(2);
        const deleted_machine = page.locator("table").nth(-1);
        await expect(deleted_machine).toBeVisible();
        await expect(deleted_machine.locator("tr").nth(-1)).toContainText("No deleted machines yet");
    })

    /**
     * Checks that the AddMachineForm is functional, add a machine with 4CPU, 16GB RAM and 4 GPU with 16GB RAM each
     */
    test('[Admin] Add a machine', async ({page}) => {
        await page.goto('/');

        await page.getByRole('link', {name: "Admin dashboard"}).click();
        await expect(page).toHaveURL(/.*admin/);

        // TABS
        const machines_tab = page.locator("button[title='Machines tab']");
        await machines_tab.click();

        const addMachineButton = page.locator("button[title='Add a machine']");
        await expect(addMachineButton).toBeVisible();

        const machine_list = page.locator("table");
        await expect(machine_list).toBeVisible();

        // Check the "Add a machine" functionality
        await machines_tab.click();
        const popupContainer = page.locator("div[class='popup-container']");
        await expect(popupContainer).not.toBeVisible();

        const errorPopup = popupContainer.locator("div[class='error-popup']");
        await expect(errorPopup).not.toBeVisible();

        await addMachineButton.click();

        // Checks that the popup-container is visible after clicking the button
        await expect(popupContainer).toBeVisible();

        // Checks that the form is visible
        const form = popupContainer.locator("form");
        await expect(form).toBeVisible();

        // STEP 1 : Checks that the form is functional
        const name_input = form.locator("input[name='name']");
        await expect(name_input).toBeVisible();
        await name_input.fill("test_machine");

        const cpu_input = form.locator("input[name='nb_cpu']");
        await expect(cpu_input).toBeVisible();
        await cpu_input.fill("4");

        const ram_input = form.locator("input[name='ram_gb']");
        await expect(ram_input).toBeVisible();
        await ram_input.fill("16");

        const nb_gpu = form.locator("input[name='nb_gpu']");
        await expect(nb_gpu).not.toBeVisible();

        await page.check('input[name="has_gpu"][value="has_gpu_true"]');
        await expect(nb_gpu).toBeVisible();

        await nb_gpu.fill("4");

        const submit_button = form.locator("button[type='submit']");
        await expect(submit_button).toBeVisible();
        await expect(submit_button).toHaveText("+Add a machine");
        await submit_button.click();

        await expect(popupContainer).not.toBeVisible();

        // STEP 2 : Checks that the machine is displayed at the end of the list
        const new_machine = machine_list.locator("tr").nth(-1);
        await expect(new_machine).toBeVisible();

        await expect(new_machine.locator("td").nth(0)).toContainText("test_machine");
        await expect(new_machine.locator("td").nth(1)).toContainText("4 CPU");
        await expect(new_machine.locator("td").nth(1)).toContainText("16GB");
        await expect(new_machine.locator("td").nth(1)).toContainText("4 GPU");
        await expect(new_machine.locator("td").nth(1)).toContainText("[16,16,16,16]");
    });

    /**
     * Delete a machine, checks that it is displayed in the deleted machine list
     */
    test('[Admin] Delete a machine', async ({page}) => {
        await page.goto('/');

        await page.getByRole('link', {name: "Admin dashboard"}).click();
        await expect(page).toHaveURL(/.*admin/);

        // TABS
        const machines_tab = page.locator("button[title='Machines tab']");
        await machines_tab.click();

        const machine_list = page.locator("table");

        const machine_name = machine_list.locator("tr").nth(1).locator("td").nth(0);
        const machineNameValue = await machine_name.innerText();

        const restore_machine_button = machine_list.locator("tr").nth(1).locator("button[title='Restore machine']");
        await expect(restore_machine_button).not.toBeVisible();

        const delete_machine_button = machine_list.locator("tr").nth(1).locator("button[title='Delete the machine']");
        await expect(delete_machine_button).toBeVisible();
        await delete_machine_button.click();

        await expect(restore_machine_button).toBeVisible();

        await page.getByRole('link', {name: "Calendar"}).click();
        await expect(page).toHaveURL("/");

        // We check if the machine is not displayed as bookable
        const popupContainer = page.locator("div[class='popup-container']");

        const addReservationButton = page.locator("button[title='Add a reservation']");
        await addReservationButton.click();
        const form = popupContainer.locator("form");

        const taskNameInput = form.locator("input[name='task_name']");
        await taskNameInput.fill("Test task");

        const submitButton = form.locator("button[type='submit']");
        await submitButton.click();

        const clickableHour = form.locator("div[class='row hour-selector']").locator("button").nth(0);
        await expect(clickableHour).toBeVisible();
        await clickableHour.click();

        await expect(page.getByText(machineNameValue)).not.toBeVisible();


        const closeFormButton = form.locator("button[title='Close the form']");
        await closeFormButton.click();
        await expect(popupContainer).not.toBeVisible();

        // We go back to see that the machine is in the deleted machine list
        await page.getByRole('link', {name: "Admin dashboard"}).click();
        await expect(page).toHaveURL(/.*admin/);

        const show_deleted_machines = page.locator("button[title='Show deleted machines']");
        await expect(show_deleted_machines).toBeVisible();
        await show_deleted_machines.click();

        const deleted_machine = page.locator("table").nth(-1);
        await expect(deleted_machine).toBeVisible();
        await expect(deleted_machine.locator("tr").nth(-1)).toContainText(machineNameValue);

        // Restore the machine
        const restore_machine_button_2 = deleted_machine.locator("tr").nth(1).locator("button[title='Restore machine']");
        await expect(restore_machine_button_2).toBeVisible();
        await restore_machine_button_2.click();

        await page.getByRole('link', {name: "Calendar"}).click();
        await expect(page).toHaveURL("/");


        // We check that it is bookable again
        await addReservationButton.click();
        await taskNameInput.fill("Test task");
        await submitButton.click();
        await clickableHour.click();
        await expect(page.getByText(machineNameValue)).toBeVisible();
        await closeFormButton.click();
        await expect(popupContainer).not.toBeVisible();

        await page.getByRole('link', {name: "Admin dashboard"}).click();
        await expect(page).toHaveURL(/.*admin/);

        await show_deleted_machines.click();
        await expect(deleted_machine.locator("tr").nth(-1)).toContainText("No deleted machines yet");
    });

    /**
     * Block a machine, checks that it is not bookable anymore
     */
    test('[Admin] Block a machine', async ({page}) => {
        await page.goto('/');

        await page.getByRole('link', {name: "Admin dashboard"}).click();
        await expect(page).toHaveURL(/.*admin/);

        // TABS
        const machines_tab = page.locator("button[title='Machines tab']");
        await machines_tab.click();

        const machine_list = page.locator("table");

        const machine_name = machine_list.locator("tr").nth(1).locator("td").nth(0);
        const machineNameValue = await machine_name.innerText();

        const unblock_machine_button = machine_list.locator("tr").nth(1).locator("button[title='Unblock the machine']");
        await expect(unblock_machine_button).not.toBeVisible();

        const block_machine_button = machine_list.locator("tr").nth(1).locator("button[title='Block the machine']");
        await expect(block_machine_button).toBeVisible();
        await block_machine_button.click();

        await expect(unblock_machine_button).toBeVisible();

        await page.getByRole('link', {name: "Calendar"}).click();
        await expect(page).toHaveURL("/");

        // We check if the machine is not displayed as bookable
        const popupContainer = page.locator("div[class='popup-container']");

        const addReservationButton = page.locator("button[title='Add a reservation']");
        await addReservationButton.click();
        const form = popupContainer.locator("form");

        const taskNameInput = form.locator("input[name='task_name']");
        await taskNameInput.fill("Test task");

        const submitButton = form.locator("button[type='submit']");
        await submitButton.click();

        const clickableHour = form.locator("div[class='row hour-selector']").locator("button").nth(0);
        await expect(clickableHour).toBeVisible();
        await clickableHour.click();

        await expect(page.getByText(machineNameValue)).not.toBeVisible();


        const closeFormButton = form.locator("button[title='Close the form']");
        await closeFormButton.click();
        await expect(popupContainer).not.toBeVisible();

        // We go back to see to unblock the machine
        await page.getByRole('link', {name: "Admin dashboard"}).click();
        await expect(page).toHaveURL(/.*admin/);

        // Unblock the machine
        await expect(block_machine_button).not.toBeVisible();
        await unblock_machine_button.click();
        await expect(block_machine_button).toBeVisible();

        await page.getByRole('link', {name: "Calendar"}).click();
        await expect(page).toHaveURL("/");


        // We check that it is bookable again
        await addReservationButton.click();
        await taskNameInput.fill("Test task");
        await submitButton.click();
        await clickableHour.click();
        await expect(page.getByText(machineNameValue)).toBeVisible();
        await closeFormButton.click();
        await expect(popupContainer).not.toBeVisible();
    });
});