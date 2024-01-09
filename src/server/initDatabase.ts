import {remult} from "remult";

import {Machine} from "../shared/Machine";
import {User} from "../shared/User";

/**
 * Initialize the database with default machine and default admin user
 * Called every time the server starts
 * Proceeds with the inserts if the Machine and User tables are empty
 */
const initDatabase = async () => {

    // MACHINES
    const machineRepo = remult.repo(Machine);
    const machines = await machineRepo.find();

    // If no machines are present in DB look for ./db/machines.json and insert them
    if (machines.length === 0) {
        const machines: Machine[] = require("../../db/machines.json");
        if(!machines || machines.length === 0){
            console.error("No machines found in db/machines.json\nServer stopped");
            process.exit(1);
        }

        for (const machine of machines) {
            try {
                await machineRepo.save(machine);
            } catch (error : any) {
                console.error("Error while inserting machine " + machine.name + " in the database\nServer stopped\n" + error);
            }
        }
    }

    // DEFAULT ADMIN USER
    const userRepo = remult.repo(User);
    const users = await userRepo.find();

    // If there is no users in the DB, add the DEFAULT_ADMIN defined in environment variables
    if (users.length === 0) {
        // If the environment is DEV, add the default admin and user
        if(process.env['ENV'] === 'DEV') {
            await userRepo.save({
                account: "admin",
                name: "admin",
                mail: "admin@admin",
                isAdmin: true
            });

            await userRepo.save({
                account: "user",
                name: "user",
                mail: "user@user"
            });
        } else {
            // In production, add the default admin defined in environment variables
            await userRepo.save({
                account: process.env["DEFAULT_ADMIN_ACCOUNT"],
                name: process.env["DEFAULT_ADMIN_NAME"],
                mail: process.env["DEFAULT_ADMIN_MAIL"],
                isAdmin: true
            })
        }

    }

}

export default initDatabase;