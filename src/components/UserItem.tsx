import React, {FC, useState} from "react";
import ReactSwitch from "react-switch";

import {User} from "../shared/User";
import {UserController} from "../shared/UserController";


interface UserItemProps {
    user: User;
}

const UserItem: FC<UserItemProps> = ({user}) => {

    const [isAdmin, setIsAdmin] = useState<boolean>(user?.isAdmin ? user.isAdmin : false);
    const handleOptionChange = async (checked: boolean) => {
        try {
            await UserController.changeAdminStatus(user.id, checked)
                .then(() => setIsAdmin(checked))
        } catch (error: any) {
            alert(error.message)
        }
    };

    return (
        <tr>
            <td>{user.account}</td>

            <td><a href={"mailto:" + user.mail}>{user.mail}</a></td>

            <td>
                <div className="row center small-gap">
                    <span>No</span>
                    <ReactSwitch checked={isAdmin}
                                 onChange={handleOptionChange}
                                 checkedIcon={false}
                                 uncheckedIcon={false}
                                 onColor={"#44bdaa"}/>
                    <span>Yes</span>
                </div>

            </td>
        </tr>)
}

export default UserItem;