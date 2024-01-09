import React, {FC, useEffect, useState} from "react";
import {remult} from "remult";

import MachineList from "../components/MachineList";
import DeletedMachineList from "../components/DeletedMachineList";
import AddMachinePopUp from "../components/AddMachinePopUp";
import GraphReservationWeek from "../components/GraphReservationWeek";
import UserList from "../components/UserList";
import {MachineController} from "../shared/MachineController";
import {User} from "../shared/User";


const AdminPage: FC = () => {

    const [showAddMachineForm, setShowAddMachineForm] = React.useState<boolean>(false);
    const [showDeletedMachines, setShowDeletedMachines] = React.useState<boolean>(false);

    const [machinesInfos, setMachinesInfos] = useState<any []>([]);
    const [deletedMachines, setDeletedMachines] = useState<any []>([]);
    const [users, setUsers] = useState<User []>([]);


    // @ts-ignore
    const app_version = __APP_VERSION__;

    const [currentTab, setCurrentTab] = React.useState<'Machines' | 'Statistics' | 'Users'>('Machines');

    const setTabToMachines = () => {
        setCurrentTab("Machines");
    }

    const setTabToStatistics = () => {
        setCurrentTab("Statistics");
    }

    const setTabToUsers = () => {
        setCurrentTab("Users");
    }

    useEffect(() => {
        MachineController.getMachineCurrentUse().then(setMachinesInfos);
        MachineController.getDeletedMachines().then(setDeletedMachines);
        remult.repo(User).find({orderBy: {account: "asc"}}).then(setUsers);
    }, []);

    return (
        <>
            <div className="row center">
                <button className={`tab${currentTab === "Machines" ? ' current-tab' : ''}`}
                        onClick={setTabToMachines}
                        title={"Machines tab"}
                >
                    Machines 💻
                </button>

                <button className={`tab${currentTab === "Statistics" ? ' current-tab' : ''}`}
                        onClick={setTabToStatistics}
                        title={"Statistics tab"}
                >
                    Statistics 📊
                </button>

                <button className={`tab${currentTab === "Users" ? ' current-tab' : ''}`}
                        onClick={setTabToUsers}
                        title={"Users tab"}
                >
                    Users 👨‍💻
                </button>

            </div>

            {currentTab === "Machines" &&
                <div className="column center">
                    <div className="row small-gap center">
                        <h2>Machines 💻</h2>

                        <button className="main-button"
                                onClick={() => setShowAddMachineForm(true)}
                                title={"Add a machine"}
                        >
                            <span className="button-icon">+</span>
                            Add a machine
                        </button>
                    </div>

                    <MachineList machinesInfos={machinesInfos}/>

                    {showDeletedMachines ? <>
                            <button className="cancel-button"
                                    onClick={() => setShowDeletedMachines(!showDeletedMachines)}
                                    title="Hide deleted machines">
                                Hide deleted machines
                            </button>
                            <h3>Deleted machines : </h3>
                            <DeletedMachineList deletedMachines={deletedMachines}/>

                        </>
                        :
                        <button className="cancel-button"
                                onClick={() => setShowDeletedMachines(!showDeletedMachines)}
                                title="Show deleted machines">
                            Show deleted machines</button>
                    }
                </div>}

            {currentTab === "Statistics" &&

                <div className="column center">
                    <h2>Statistics 📊</h2>
                    <GraphReservationWeek/>
                </div>}

            {currentTab === "Users" &&

                <div className="column center">
                    <h2>Users 👨‍💻</h2>
                    <UserList users={users}/>
                </div>}


            {showAddMachineForm &&
                <AddMachinePopUp setShowAddMachineForm={setShowAddMachineForm} setMachinesInfos={setMachinesInfos}/>}

            <div className="row center">
                <p>Resapp V{app_version}</p>
            </div>
        </>
    )
}

export default AdminPage;