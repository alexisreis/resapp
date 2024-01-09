import {Allow, BackendMethod, remult} from "remult";

import {Reservation} from "./Reservation";
import {Machine} from "./Machine";
import {Action, Log} from "./Log";
import {Roles} from "./User";
import {EventAttributes} from "ics";

export class ReservationController {

    /**
     * Method called to add a Reservation
     * Checks is there is no overlapping in resources between two Reservations
     * Suppose that the reservation has been proposed by the service
     * @param reservation the Reservation to add
     */
    @BackendMethod({allowed: Allow.authenticated})
    static async addReservation(reservation: Reservation) {

        // Check if the date are valid
        if (reservation.begin_date >= reservation.ending_date) {
            throw new Error('The beginning date must be before the ending date.');
        }

        if (reservation.begin_date < new Date()) {
            throw new Error('The beginning date must be in the future.');
        }

        if (reservation.ending_date < new Date()) {
            throw new Error('The ending date must be in the future.');
        }

        if (reservation.task_name.length < 1) {
            throw new Error('The task name must not be empty.');
        }

        const reservationRepo = remult.repo(Reservation)
        const machineRepo = remult.repo(Machine);

        const machineRequested = await machineRepo.findFirst({id: reservation.machine.id});
        // Check if the machine exists or is deleted
        if (!machineRequested || machineRequested.deleted) {
            throw new Error('The machine does not exist.');
        }

        // Check if the machine is blocked
        if (machineRequested.blocked) {
            throw new Error('The machine is blocked and cannot accept new reservations.');
        }


        // Check if the number of CPUs required is not greater than the number of CPUs available on the machine
        if (reservation.nb_cpu > reservation.machine.nb_cpu) {
            throw new Error('The number of CPUs required is greater than the number of CPUs available on the machine.');
        }

        // Check if the number of CPUs required is greater than 0
        if (reservation.nb_cpu < 1) {
            throw new Error('The number of CPUs required must be greater than 0.');
        }

        // Check if the amount of RAM required is not greater than the amount of RAM available on the machine
        if (reservation.ram_gb > reservation.machine.ram_gb) {
            throw new Error('The amount of RAM required is greater than the amount of RAM available on the machine.');
        }

        // Check if the amount of RAM required is greater than 0
        if (reservation.ram_gb < 1) {
            throw new Error('The amount of RAM required must be greater than 0.');
        }

        // Check GPUs
        const gpuRequired = (reservation.gpu_ram_gb && reservation.gpu_ram_gb.length > 0) ? (reservation.gpu_ram_gb.reduce((a, b) => a + b, 0) > 0) : 0;
        // If GPU is required, check if the machine has a GPU
        if (gpuRequired && !reservation.machine.has_gpu) {
            throw new Error('The machine does not have a GPU.');
        }
        // If GPU is required, check if the reservation does not ask more than the machine GPU RAM
        if (gpuRequired && reservation.gpu_ram_gb && machineRequested?.gpu_ram_gb) {
            for (let i = 0; i < machineRequested.gpu_ram_gb.length; i++) {
                if (reservation.gpu_ram_gb[i] > 0 && reservation.gpu_ram_gb[i] > machineRequested.gpu_ram_gb[i]) {
                    throw new Error('The amount of GPU RAM required is greater than the amount of GPU RAM available on the machine.');
                }
            }
        }

        // Look for previous reservations on the same machine at the same time
        const existingReservations = await reservationRepo.find({
            where: {
                begin_date: {$lt: reservation.ending_date},
                ending_date: {$gt: reservation.begin_date},
                machine: {$id: reservation.machine.id},
            }
        });

        // Check if the resources are available
        if (existingReservations.length > 0) {

            let availableCpu = reservation.machine.nb_cpu;
            let availableRam = reservation.machine.ram_gb;

            let availableGpusRam: number[] = [];

            if (gpuRequired && reservation.machine.gpu_ram_gb) {
                availableGpusRam = reservation.machine.gpu_ram_gb;
            }

            for (const existingReservation of existingReservations) {
                availableCpu -= existingReservation.nb_cpu;
                availableRam -= existingReservation.ram_gb;

                if (gpuRequired && existingReservation.gpu_ram_gb) {
                    for (let i = 0; i < existingReservation.gpu_ram_gb.length; i++) {
                        availableGpusRam[i] -= existingReservation.gpu_ram_gb[i];
                    }
                }
            }

            if (availableCpu - reservation.nb_cpu < 0) {
                throw new Error('The number of CPUs available on the machine during the reservation is not enough.');
            }

            if (availableRam - reservation.ram_gb < 0) {
                throw new Error('The amount of RAM available on the machine during the reservation is not enough.');
            }

            if (gpuRequired && reservation.gpu_ram_gb) {
                for (let i = 0; i < reservation.gpu_ram_gb.length; i++) {
                    if (availableGpusRam[i] - reservation.gpu_ram_gb[i] < 0) {
                        throw new Error('The amount of GPU RAM available on the machine during the reservation is not enough.');
                    }
                }
            }

        }

        // If the resources are available, we can add the reservation
        try {
            await reservationRepo.save(reservation)
                .then(async () => {
                    await remult.repo(Log).save({
                        action: Action.CREATE_RESERVATION,
                        user_name: remult.user?.name,
                        entity: reservation
                    });
                })
        } catch (error: any) {
            // throw new Error('An error occurred while saving the reservation.');
            throw new Error('An error occurred while saving the reservation:\n' + error);
        }

        try {
            await sendMail(reservation);
        } catch (error: any) {
            // throw new Error('An error occurred while sending the email.');
            throw new Error("An error occurred while sending the email:\n" + error);
        }
    }

    /**
     * Method called to delete a Reservation
     * Only an admin or the user who created the reservation can delete it
     * @param reservation
     */
    @BackendMethod({allowed: Allow.authenticated})
    static async deleteReservation(reservation: Reservation) {
        const reservationRepo = remult.repo(Reservation)

        // Check if user has the rights to delete the reservation
        if (!remult.user?.isAdmin && remult.user?.id !== reservation.user.id) {
            throw new Error("You have no rights to delete a reservation you did not create.");
        }

        // Check if the reservation is not already passed
        // If the user is not an admin, he can only delete a reservation that is not passed
        if (!remult.user?.isAdmin && new Date(reservation.ending_date) < new Date()) {
            throw new Error("You have no rights to delete a reservation that is passed.");
        }

        try {
            await reservationRepo.delete(reservation)
                .then(async () => {
                    await remult.repo(Log).save({
                        action: Action.DELETE_RESERVATION,
                        user_name: remult.user?.name,
                        entity: reservation
                    });
                })
        } catch (e: any) {
            throw new Error("An error occurred while deleting the reservation.");
        }
    }

    /**
     * Method called to request resources in a time range
     * @param begin_date disponibility start date
     * @param end_date disponibility end date
     * @param duration duration of the task
     * @param task_name name of the task
     * @param nb_cpu number of cpu required
     * @param ram_gb amount of ram required
     * @param gpu_ram_gb amount of gpu ram required
     */
    @BackendMethod({allowed: Allow.authenticated})
    static async requestResources(begin_date: Date, end_date: Date, duration: number, task_name: string, nb_cpu: number, ram_gb: number, gpu_ram_gb: number) {

        if (begin_date == null) {
            throw new Error("The begin date cannot be null.");
        }

        if (begin_date < new Date()) {
            throw new Error("The begin date cannot be in the past.");
        }

        if (end_date == null) {
            throw new Error("The end date cannot be null.");
        }
        if (begin_date >= end_date) {
            throw new Error("The begin date must be before the end date.");
        }
        if (duration < 1) {
            throw new Error("The duration must be greater than 0.");
        }
        if (duration > Math.abs(new Date(end_date).getTime() - new Date(begin_date).getTime()) / (1000 * 60 * 60)) {
            throw new Error("The duration asked is greater than the duration between the begin date and the end date.");
        }
        if (task_name == "") {
            throw new Error("The task name cannot be empty.");
        }
        if (nb_cpu < 1) {
            throw new Error("The number of CPUs must be greater than 0.");
        }
        if (ram_gb < 1) {
            throw new Error("The amount of RAM must be greater than 0.");
        }
        if (gpu_ram_gb < 0) {
            throw new Error("The amount of GPU RAM must be greater than or equal to 0.");
        }

        const reservationRepo = remult.repo(Reservation);
        const machineRepo = remult.repo(Machine);

        let machines;
        // TODO : if GPU isn't required but thre is no noGPU machine available return GPU machine as well
        if (gpu_ram_gb > 0) {
            machines = await machineRepo.find({where: {blocked: false, deleted: false, has_gpu: true}});
        } else {
            machines = await machineRepo.find({where: {blocked: false, deleted: false}});
        }

        let possibleReservations = [];

        let latestStartTime = new Date(end_date);
        latestStartTime.setHours(latestStartTime.getHours() - Number(duration));

        for (let start_time = new Date(begin_date); start_time <= latestStartTime; start_time.setHours(start_time.getHours() + 1)) {
            let possibleStartTimes = [];

            for (let machine of machines) {
                let isFree = true;

                let availableCpu = machine.nb_cpu;
                let availableRam = machine.ram_gb;
                let availableGpusRam = (gpu_ram_gb && machine.gpu_ram_gb) ? machine.gpu_ram_gb.slice() : [];

                let end_time = new Date(start_time);
                end_time.setHours(start_time.getHours() + Number(duration));

                let existingReservations = await reservationRepo.find({
                    where: {
                        begin_date: {$lt: end_time},
                        ending_date: {$gt: start_time},
                        machine: {$id: machine.id},
                    }
                });

                if (existingReservations.length > 0) {
                    isFree = false;
                    for (const existingReservation of existingReservations) {
                        availableCpu -= existingReservation.nb_cpu;
                        availableRam -= existingReservation.ram_gb;

                        if (existingReservation.gpu_ram_gb) {
                            for (let i = 0; i < existingReservation.gpu_ram_gb.length; i++) {
                                availableGpusRam[i] -= existingReservation.gpu_ram_gb[i];
                            }
                        }
                    }
                }

                // GPU-less reservation
                if (availableCpu - nb_cpu >= 0 && availableRam - ram_gb >= 0 && !gpu_ram_gb) {
                    possibleStartTimes.push({
                        machine: machine,
                        isFree: isFree
                    });
                    continue;
                }

                // GPU reservation
                const totalAvailableGpusRam = availableGpusRam.reduce((a, b) => a + b, 0);
                if (availableCpu - nb_cpu >= 0 && availableRam - ram_gb >= 0 && gpu_ram_gb && totalAvailableGpusRam - gpu_ram_gb >= 0) {
                    possibleStartTimes.push({
                        machine: machine,
                        isFree: isFree,
                        availableGpusRam: proposeBooking(gpu_ram_gb, availableGpusRam)
                    });
                }
            }

            if (possibleStartTimes.length > 0) {
                possibleReservations.push({
                    start_time: new Date(start_time),
                    possibleReservations: possibleStartTimes,
                    duration: duration
                });
            }
        }
        return possibleReservations;
    }

    /**
     * Method to get statistics for a week in the past
     * @param weeks_prior number of week in the past (0 is the current week, 1 is the previous week, etc.)
     */
    @BackendMethod({allowed: Roles.admin})
    static async getNumberOfReservationPerMachinePerWeek(weeks_prior: number) {

        if (weeks_prior < 0) {
            throw new Error("The number of weeks prior must be greater than or equal to 0.");
        }

        const date = new Date();
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);

        const startOfWeek = new Date(date.setDate(diff));
        startOfWeek.setDate(startOfWeek.getDate() - weeks_prior * 7);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        let week = "";
        let options: Intl.DateTimeFormatOptions = {month: 'long', day: 'numeric'};
        let formattedBeginDate = startOfWeek.toLocaleString("en-US", options);
        let formattedEndDate = endOfWeek.toLocaleDateString("en-US", options);

        if (startOfWeek.getMonth() !== endOfWeek.getMonth()) {
            week = `${formattedBeginDate} - ${formattedEndDate}`;
        } else {
            week = `${formattedBeginDate} - ${formattedEndDate.split(' ')[1]}`;
        }

        const reservationRepo = remult.repo(Reservation);
        const machineRepo = remult.repo(Machine);

        const machines = await machineRepo.find({where: {deleted: false}});
        const reservations = await reservationRepo.find({where: {begin_date: {$gte: startOfWeek, $lte: endOfWeek}}});

        const reservationsPerMachine = new Map<string, number[]>();
        for (const machine of machines) {
            reservationsPerMachine.set(machine.name, [0, 0]);
        }

        let machinesNames: string[] = [];
        let numberOfReservationsPerMachine: number[] = [];
        let numberOfHoursPerMachine: number[] = [];
        let meanDuration = 0;

        for (const reservation of reservations) {
            const reservationDuration = (reservation.ending_date.getTime() - reservation.begin_date.getTime()) / (1000 * 60 * 60);
            meanDuration += reservationDuration;
            // @ts-ignore
            reservationsPerMachine.set(reservation.machine.name, [reservationsPerMachine.get(reservation.machine.name)[0] + 1, reservationsPerMachine.get(reservation.machine.name)[1] + reservationDuration]);
        }
        meanDuration /= reservations.length;


        reservationsPerMachine.forEach((value, key) => {
            machinesNames.push(key);
            numberOfReservationsPerMachine.push(value[0]);
            numberOfHoursPerMachine.push(value[1]);
        })

        return {
            week: week,
            machinesNames: machinesNames,
            numberOfReservationsPerMachine: numberOfReservationsPerMachine,
            numberOfHoursPerMachine: numberOfHoursPerMachine,
            totalNumberOfReservations: reservations.length,
            meanDuration: parseInt(meanDuration.toFixed(0))
        };
    }

}

/**
 * Method to propose an optimized GPU booking for a GPU reservation request
 * @param desired the amount of GPU RAM desired by the user
 * @param available the array of available GPU RAM for each GPU
 *
 * @returns an array of the same size as available, where each element is the amount of GPU RAM booked for the corresponding GPU
 */
const proposeBooking = (desired: number, available: number[]) => {

    const proposal = available.map(() => 0);

    let minResource = Infinity;
    let minIndex = -1;
    // Check if desire can be satisfied by a single resource and if so return the index of that resource
    // The resource must be the minimum available resource that is greater than or equal to the desired resource
    for (let i = 0; i < available.length; i++) {
        if (available[i] >= desired && available[i] < minResource) {
            minResource = available[i];
            minIndex = i;
        }
    }
    if (minIndex !== -1) {
        proposal[minIndex] = desired;
        return proposal;
    }

    // If the desired resource cannot be satisfied by a single resource, then try to satisfy it by multiple resources

    let remaining = desired;

    while (remaining > 0) {

        // First get the maximum resource available and book it
        let maxResource = 0;
        let maxIndex = -1;

        for (let i = 0; i < available.length; i++) {
            if (available[i] > maxResource) {
                maxResource = available[i];
                maxIndex = i;
            }
        }

        remaining -= maxResource;
        proposal[maxIndex] = maxResource;
        available[maxIndex] = 0;

        // Then get the minimum resource available and that satisfies the remaining and book it
        minResource = Infinity;
        minIndex = -1;
        for (let i = 0; i < available.length; i++) {
            if (available[i] >= remaining && available[i] < minResource) {
                minResource = available[i];
                minIndex = i;
            }
        }
        // If it's possible book it and return the proposal
        if (minIndex !== -1) {
            proposal[minIndex] = remaining;
            return proposal;
        }
        // If not, do another loop that gets the max...
    }

    return proposal;
}

/**
 * Method to email an ics file to the user that made the reservation
 * @param reservation the reservation the user has made
 */
const sendMail = async (reservation: Reservation) => {

    /*
    // Import server only dependencies
    const nodemailer = await import("nodemailer");
    const ics = await import("ics");
    const server_settings = await import("../server/settings");

    try {
        // Create the ics file
        const begin_date = new Date(reservation.begin_date);
        const ending_date = new Date(reservation.ending_date);

        const event: EventAttributes = {
            start: [begin_date.getFullYear(), begin_date.getMonth() + 1, begin_date.getDate(), begin_date.getHours(), begin_date.getMinutes()],
            end: [ending_date.getFullYear(), ending_date.getMonth() + 1, ending_date.getDate(), ending_date.getHours(), ending_date.getMinutes()],
            title: `Reservation of ${reservation.machine.name}`,
            description: `You have reserved the machine ${reservation.machine.name} from ${begin_date.toLocaleString()} to ${ending_date.toLocaleString()}`,
        }

        const mail = generateHTMLMail(reservation);

        ics.createEvent(event, async (error, value) => {
            if (error) {
                console.error(`Error at creating ics file: ${error}`)
            }

            const transporter = nodemailer.createTransport(server_settings.default.mailer.mta);

            await transporter.sendMail({
                from: server_settings.default.mailer.from,
                to: reservation.user.mail,
                subject: "Reservation confirmation 📅",
                text: `Hello ${reservation.user.name},
                Your reservation is confirmed :
                - Date : ${begin_date.toDateString()} at ${begin_date.getHours()}:00
                - Machine : ${reservation.machine.name}
                - Resources : ${reservation.nb_cpu} CPU | ${reservation.ram_gb} GB RAM ${reservation.gpu_ram_gb && " | " + reservation.gpu_ram_gb.toString() + "GB GPU RAM"}
                Happy coding,
                Resapp`,
                html: mail,
                icalEvent: {
                    filename: "reservation.ics",
                    content: value
                }
            }, (error, info) => {
                if (error) {
                    console.error(`Error at sending mail: ${error}`)
                } else {
                    console.log(`Mail sent: ${info}`);
                }
            });
        });

    } catch (error: any) {
        console.error(500, `Error at sending mail: ${error}`)
    }

     */
}

const generateHTMLMail = (reservation: Reservation) => `<html>
  <head>
    <style>
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        font-family: Arial, sans-serif;
      }
      .header {
        text-align: center;
        background-color: #44bdaa;
        color: #f6f6f6;
        padding: .5em;
      }
      .content {
        background-color: #f6f6f6;
        padding: 1em;
      }
      .footer {
        text-align: center;
        margin-top: 1em;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Resapp</h1>
      </div>
      <div class="content">
        <p>Hello ${reservation.user.name},</p>
        <p>Your reservation is confirmed : 
            <ul>
                <li>Date : <strong>${new Date(reservation.begin_date).toDateString()} at ${new Date(reservation.begin_date).getHours()}:00</strong></li>
                <li>Machine : <strong>${reservation.machine.name}</strong></li>
                <li>Resources : ${reservation.nb_cpu} CPU | ${reservation.ram_gb} GB RAM ${reservation.gpu_ram_gb && " | " + reservation.gpu_ram_gb.toString() + "GB GPU RAM"}</li>
            </ul>
        <p>Happy coding,</p>
      </div>
      <div class="footer">
        Resapp
      </div>
    </div>
  </body>
</html> `