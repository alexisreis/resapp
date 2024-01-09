import {Allow, Entity, Fields} from "remult";

export const Roles = {
    admin:"admin"
}

@Entity('users', {
    allowApiCrud: false,
    allowApiRead: Allow.authenticated,
    caption: "Users",
})
export class User {

    @Fields.cuid()
    id!: string;

    @Fields.string({caption: 'Account'})
    account!: string;

    @Fields.string({caption: 'Name'})
    name!: string;

    @Fields.string({caption: 'Mail'})
    mail!: string;

    @Fields.boolean({caption: 'Admin', allowApiUpdate: Roles.admin, includeInApi: Roles.admin})
    isAdmin?: boolean;
}

