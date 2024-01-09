import {Entity, Fields, Field, Allow} from "remult";
import {Machine} from "./Machine";
import {User} from "./User";

// Define the Reservation entity
@Entity('reservations', {
    allowApiCrud: false,
    allowApiRead: Allow.authenticated,
    caption: "Reservations",
})
export class Reservation {

    @Fields.cuid()
    id?: string;

    @Fields.string({caption: 'Task Name'})
    task_name!: string;

    @Field ( () => User, {caption: 'User'})
    user!: User;

    @Field(() => Machine, {caption: 'Machine'})
    machine!: Machine;

    @Fields.date({caption: 'Date begin'})
    begin_date!: Date;

    @Fields.date({caption: 'Date ending'})
    ending_date!: Date;

    @Fields.integer({caption: 'Number of CPUs'})
    nb_cpu!: number;

    @Fields.integer({caption: 'RAM in GB'})
    ram_gb!: number;

    @Fields.json({caption: 'GPUs RAM in GB'})
    gpu_ram_gb?: number[] = [];

}