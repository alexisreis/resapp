import React, {FC, useState} from "react";

import {MachineController} from "../shared/MachineController";
import trash from "../assets/trash.svg";
import {ArrowForwardIcon, DeleteIcon} from "./SVGIcons";


interface DeletedMachineItemProps {
    machine: {
        id: string,
        name: string,
        nb_cpu: number,
        ram_gb: number,
        has_gpu: boolean,
        nb_gpu: number,
        gpu_ram_gb: number [],
        blocked: boolean,
        deleted: boolean,
    }
}

const DeletedMachineItem: FC<DeletedMachineItemProps> = ({machine}) => {

    const [deleted, setDeleted] = useState<boolean>(machine.deleted);

    const deleteMachine = async (deleted: boolean) => {
        try{
            await MachineController.deleteMachine(machine.id, deleted)
                .then(() => setDeleted(deleted))
        } catch (error: any) {
            alert(error.message)
        }
    }

    return (
        <tr>
            <td>{machine.name} ❌</td>
            <td>
                <ul>
                    <li>x{machine.nb_cpu} CPUs</li>
                    <li>{machine.ram_gb}GB</li>
                    {machine.has_gpu ?
                        <li><p>x{machine.nb_gpu} GPUs</p> <p> [{machine.gpu_ram_gb.toString()}] GB RAM</p></li>
                        : null}
                </ul>
            </td>
            <td>
                <div className="row center">
                    {deleted ?
                        <button className="round-button rotate270"
                                onClick={() => deleteMachine(false)}
                                title="Restore machine">
                            <ArrowForwardIcon />
                        </button> : <span>Machine restored</span>}

                </div>
            </td>
        </tr>)
}

export default DeletedMachineItem;