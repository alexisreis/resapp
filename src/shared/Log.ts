import { Entity, Fields } from "remult";

import {Reservation} from "./Reservation";
import {Machine} from "./Machine";
import {Roles, User} from "./User";

@Entity('logs', {
    allowApiCrud: Roles.admin,
    caption: "Logs",
})
export class Log {

    @Fields.createdAt()
    date = new Date();

    @Fields.string({caption: 'User'})
    user_name!: string;

    @Fields.object({caption: 'Action'})
    action!: Action;

    @Fields.json({caption: 'Entity'})
    entity!: Reservation | Machine | User;
}

export enum Action {
    CREATE_RESERVATION = "Create reservation",
    DELETE_RESERVATION = "Delete reservation",
    CREATE_MACHINE = "Create machine",
    DELETE_MACHINE = "Delete machine",
    UNDELETE_MACHINE = "Undelete machine",
    BLOCK_MACHINE = "Block machine",
    UNBLOCK_MACHINE = "Unblock machine",
    ADD_ADMIN_STATUS = "Add admin status",
    REMOVE_ADMIN_STATUS = "Remove admin status",
}