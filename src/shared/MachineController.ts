import {BackendMethod, remult} from "remult";
import {Machine} from "./Machine";
import {Roles} from "./User";
import {Reservation} from "./Reservation";
import {Action, Log} from "./Log";

export class MachineController {

    /**
     * ADMIN ONLY
     * Get the current percentage of use of each machine in an array with machine infos
     */
    @BackendMethod({
        allowed: Roles.admin
    })
    static async getMachineCurrentUse() {
        const machineRepo = remult.repo(Machine);
        const machines = await machineRepo.find({where: {deleted: false}});

        const current_reservations = await remult.repo(Reservation).find({
           where: {
               begin_date: { "$lte" : new Date()},
               ending_date: { "$gte" : new Date()},
           }
        });

        let machines_percentage_of_use = machines.map(machine => {
            return {
                id: machine.id,
                name: machine.name,
                nb_cpu: machine.nb_cpu,
                ram_gb: machine.ram_gb,
                has_gpu: machine.has_gpu,
                nb_gpu: machine.nb_gpu,
                gpu_ram_gb: machine.gpu_ram_gb,
                blocked: machine.blocked,
                deleted: machine.deleted,
                used_cpu: 0,
                used_ram: 0,
                used_gpu: 0,
            }
        });

        for(let reservation of current_reservations){
            for(let machine of machines_percentage_of_use){

                const machine_gpu = machine.gpu_ram_gb ? machine.gpu_ram_gb.reduce( (a, b) => a + b, 0) : 0;

                if(reservation.machine.id === machine.id){
                    machine.used_cpu += (reservation.nb_cpu/machine.nb_cpu)*100;
                    machine.used_ram += (reservation.ram_gb)/machine.ram_gb*100;


                    const reservation_gpu = reservation.gpu_ram_gb ? reservation.gpu_ram_gb.reduce((a, b) => a + b, 0) : 0;


                    if(reservation_gpu > 0 && machine.has_gpu){
                        machine.used_gpu += (reservation_gpu)/machine_gpu*100;
                    }

                }
            }
        }

        return machines_percentage_of_use;
    }

    /**
     * ADMIN ONLY
     * Get the list of all deleted machines
     */
    @BackendMethod({allowed: Roles.admin})
    static async getDeletedMachines(){
        const machineRepo = remult.repo(Machine);
        return await machineRepo.find({where: {deleted: true}});
    }

    /**
     * ADMIN ONLY
     * Block (or unblock) a machine
     * Blocking makes the machine unavailable for future bookings
     * @param machine_id the id of the machine to block / unblock
     * @param blocked true to block the machine, false to unblock it
     */
    @BackendMethod({allowed: Roles.admin})
    static async blockMachine(machine_id: string, blocked: boolean) {
        const machineRepo = remult.repo(Machine);
        const machine = await machineRepo.findId(machine_id);

        if(!machine){
            throw new Error("This machine doesn't exist");
        }

        machine.blocked = blocked;

        try {
            await machineRepo.save(machine)
                .then (async () => {
                    await remult.repo(Log).save({
                        action: blocked ? Action.BLOCK_MACHINE : Action.UNBLOCK_MACHINE,
                        user_name: remult.user?.name,
                        entity: machine,
                    });
                })
        } catch {
            throw new Error('An error occurred while attempting to block / unblock the machine');
        }
    }

    /**
     * ADMIN ONLY
     * Delete (or undelete) a machine
     * Deleting a machine makes it unavailable for future bookings
     * @param machine_id the id of the machine to delete / undelete
     * @param deleted true to delete the machine, false to undelete it
     */
    @BackendMethod({allowed: Roles.admin})
    static async deleteMachine(machine_id: string, deleted: boolean) {
        const machineRepo = remult.repo(Machine);
        const machine = await machineRepo.findId(machine_id);

        if(!machine){
            throw new Error("This machine doesn't exist");
        }

        // If the user wants to delete the machine, check if the machine is not used by a reservation
        if(deleted && machine.deleted === false){
            const reservations = await remult.repo(Reservation).find({where: {machine: machine}});
            if(reservations.length > 0){
                throw new Error("This machine is used by a reservation, you can't delete it");
            }
        }

        machine.deleted = deleted;

        try{
            await machineRepo.save(machine)
                .then (async () => {
                    await remult.repo(Log).save({
                        action: deleted ? Action.DELETE_MACHINE : Action.UNDELETE_MACHINE,
                        user_name: remult.user?.name,
                        entity: machine,
                    });
                })
        } catch {
            throw new Error('An error occurred while attempting to delete / undelete the machine');
        }

    }

    /**
     * ADMIN ONLY
     * Add a machine to the database
     * @param machine the machine to add
     */
    @BackendMethod({allowed: Roles.admin})
    static async addMachine(machine: Machine) {
        // Check if the name is not empty
        if(machine.name === ""){
            throw new Error("The name of the machine can't be empty");
        }

        // Check if the number of CPU is greater than 0
        if(machine.nb_cpu <= 0){
            throw new Error("The number of CPU must be greater than 0");
        }

        // Check if the RAM is greater than 0
        if(machine.ram_gb <= 0){
            throw new Error("The RAM must be greater than 0");
        }

        // Check if the GPU RAM is greater than 0 is has_gpu is set to true
        if(machine.has_gpu){

            // Check if nb_gpu is defined
            if(!machine?.nb_gpu){
                throw new Error("You must specify the number of GPU");
            }

            // Check if nb_gpu is greater than 0
            if(machine?.nb_gpu <= 0){
                throw new Error("The number of GPU must be greater than 0");
            }

            // Check if the GPU RAM array is defined
            if(!machine?.gpu_ram_gb){
                throw new Error("You must specify the GPU RAM for each GPU");
            }

            if(machine?.gpu_ram_gb){
                // Check if the GPU RAM array is not empty
                if(machine?.gpu_ram_gb?.length === 0 || machine?.gpu_ram_gb?.length !== machine?.nb_gpu){
                    throw new Error("You must specify the GPU RAM for each GPU");
                }
                // Check if the GPU RAM array contains only positive numbers
                for(let gpu_ram of machine.gpu_ram_gb){
                    if(gpu_ram <= 0){
                        throw new Error("The GPU RAM must be greater than 0");
                    }
                }
            }
        }

        // All good, add the machine to the repo
        const machineRepo = remult.repo(Machine);

        try {
            await machineRepo.save(machine)
                .then (async () => {
                    await remult.repo(Log).save({
                        action: Action.CREATE_MACHINE,
                        user_name: remult.user?.name,
                        entity: machine,
                    });
                })
        } catch {
            throw new Error('An error occurred while attempting to add the machine');
        }
    }
}

