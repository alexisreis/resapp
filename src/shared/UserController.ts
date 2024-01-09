import {BackendMethod, remult} from "remult";
import {Roles, User} from "./User";
import {Action, Log} from "./Log";

export class UserController {

    /**
     * Change the admin status of a user
     * @param user_id  the id of the user
     * @param isAdmin  the new admin status
     */
    @BackendMethod({
        allowed: Roles.admin
    })
    static async changeAdminStatus(user_id: string, isAdmin: boolean) {
        const userRepo = remult.repo(User);
        const user = await userRepo.findId(user_id);

        if(!user){
            throw new Error("This user doesn't exist");
        }

        if(remult.user?.id === user.id){
            throw new Error("You can't change your own admin status");
        }

        user.isAdmin = isAdmin;

        try {
            await userRepo.save(user)
                .then (async () => {
                    await remult.repo(Log).save({
                        action: isAdmin ? Action.ADD_ADMIN_STATUS : Action.REMOVE_ADMIN_STATUS,
                        user_name: remult.user?.name,
                        entity: user,
                    });
                })
        } catch {
            throw new Error('An error occurred while attempting to add / remove the admin status of ' + user.account);
        }
    }
}

