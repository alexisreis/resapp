import {Allow, Entity, Fields} from "remult";

@Entity('machines', {
    allowApiCrud: false,
    allowApiRead: Allow.authenticated,
    caption: "Machines",
})
export class Machine {

    @Fields.cuid()
    id!: string;

    @Fields.string({caption: 'Name'})
    name!: string;

    @Fields.integer({caption: 'CPU Cores'})
    nb_cpu!: number;

    @Fields.integer({caption: 'RAM (in GB)'})
    ram_gb!: number;

    @Fields.boolean({caption: 'GPU'})
    has_gpu!: boolean;

    @Fields.integer({caption: 'GPU Cores'})
    nb_gpu?: number;

    @Fields.json({caption: 'GPUs RAM in GB'})
    gpu_ram_gb?: number[] = [];

    @Fields.boolean({caption: 'Blocked'})
    blocked?: boolean;

    @Fields.boolean({caption: 'Deleted'})
    deleted?: boolean;
}