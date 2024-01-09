import React, {FC} from "react";

import MachineItem from "./MachineItem";

interface MachineListProps {
    machinesInfos: any[];
}


const MachineList: FC<MachineListProps> = ({machinesInfos}) => {

    return <>
            <table>
                <colgroup>
                    <col span={1} style={{width: "20%"}}/>
                    <col span={1} style={{width: "25%"}}/>
                    <col span={1} style={{width: "35%"}}/>
                    <col span={1} style={{width: "20%"}}/>
                </colgroup>

                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Resources</th>
                        <th>Current use</th>
                        <th>Options</th>
                    </tr>
                </thead>
                <tbody>
                {machinesInfos && machinesInfos.length > 0 ?
                    <>
                        {machinesInfos
                            .map((machine, i) => <MachineItem machine={machine} key={i}/>)}
                    </>
                    :
                    <tr><td colSpan={4}>No machines were found...</td></tr>}
                </tbody>

            </table>

    </>
}

export default MachineList;