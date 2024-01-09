import React, {FC} from "react";

import DeletedMachineItem from "./DeletedMachineItem";

interface DeletedMachineListProps {
    deletedMachines: any[];
}

const DeletedMachineList: FC<DeletedMachineListProps> = ({deletedMachines}) => {

    return <>

            <table>
                <colgroup>
                    <col span={1} style={{width: "30%"}}/>
                    <col span={1} style={{width: "55%"}}/>
                    <col span={1} style={{width: "15%"}}/>
                </colgroup>

                <thead>
                <tr>
                    <th>Name</th>
                    <th>Resources</th>
                    <th>Options</th>
                </tr>
                </thead>
                <tbody>
                {deletedMachines && deletedMachines.length > 0 ?

                    deletedMachines
                        .map((machine, i) => <DeletedMachineItem machine={machine} key={i}/>)

                    : <tr><td colSpan={3}>No deleted machines yet</td></tr>}


                </tbody>

            </table>
</>
}

export default DeletedMachineList;