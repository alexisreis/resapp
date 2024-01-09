import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import {remult} from "remult";

import {Machine} from "../shared/Machine";
import {useUser} from "./UserContext";

const machineRepo = remult.repo(Machine);

interface MachinesContextType {
    machines: Machine[];
    setMachines: (data: Machine[]) => void;
}

const MachinesContext = createContext<MachinesContextType>({
    machines: [],
    setMachines: () => {
    },
});

type Props = {
    children: ReactNode;
}
const MachinesProvider = (props: Props) => {
    const [machines, setMachines] = useState<Machine[]>([]);
    const {user} = useUser();

    useEffect(() => {
        if (user === null) return;
        machineRepo
            .liveQuery({where: {blocked: false, deleted: false}})
            .subscribe(info => setMachines(info.applyChanges));
    }, [user]);

    return (
        <MachinesContext.Provider value={{machines, setMachines}}>
            {props.children}
        </MachinesContext.Provider>
    );
};

const useMachines = () => useContext(MachinesContext);

export {MachinesProvider, useMachines};