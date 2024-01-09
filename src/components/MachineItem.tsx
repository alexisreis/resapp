import React, {FC, useState} from "react";
import ReactECharts from "echarts-for-react";

import {MachineController} from "../shared/MachineController";

import {ArrowForwardIcon, DeleteIcon, LockClosedIcon, LockOpenIcon} from "./SVGIcons";

interface MachineItemProps {
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
        used_cpu: number,
        used_ram: number,
        used_gpu: number,
    }
}

const MachineItem: FC<MachineItemProps> = ({machine}) => {

    const [blocked, setBlocked] = useState<boolean>(machine.blocked);
    const [deleted, setDeleted] = useState<boolean>(machine.deleted);

    const blockMachine = async (blocked: boolean) => {
        try {
            await MachineController.blockMachine(machine.id, blocked)
                .then(() => setBlocked(blocked))
        } catch (error: any) {
            alert(error.message)
        }
    }

    const deleteMachine = async (deleted: boolean) => {
        try {
            await MachineController.deleteMachine(machine.id, deleted)
                .then(() => setDeleted(deleted))
        } catch (error: any) {
            alert(error.message)
        }
    }

    const colors: { [key: string]: string } = {
        "% CPU": '#ffd500',
        "% RAM": '#cb4b31',
        "% GPU": '#2ca83d',
    }

    const options = {
        title: {
            text: ''
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {},
        grid: {
            width: 200,
            top: 0,
            bottom: 0,
            containLabel: true,
        },
        xAxis: {
            type: 'value',
            show: true,
            max: 100,
            min: 0,
        },
        yAxis: {
            type: 'category',
            data: machine.has_gpu ? ['% GPU', '% RAM', '% CPU'] : ['% RAM', '% CPU'],
        },
        series: [
            {
                name: '',
                type: 'bar',
                data: machine.has_gpu ? [machine.used_gpu, machine.used_ram, machine.used_cpu] : [machine.used_ram, machine.used_cpu],
                itemStyle: {
                    color: (param: any) => {
                        return colors[param.name] || '#82c654';
                    }
                },
                label: {
                    show: true,
                    precision: 1,
                    position: 'right',
                    valueAnimation: true,
                    fontFamily: 'monospace'
                }
            }
        ]
    };


    return (
        <tr className={blocked ? "tr-blocked" : ""}>
            <td>{machine.name} {blocked && '🔒'}</td>
            <td>
                <ul>
                    <li>{machine.nb_cpu} CPU</li>
                    <li>{machine.ram_gb}GB</li>
                    {machine.has_gpu ?
                        <li><p>{machine.nb_gpu} GPU</p> <p> [{machine.gpu_ram_gb.toString()}] GB RAM</p></li>
                        : null}
                </ul>
            </td>

            <td><ReactECharts option={options} className="graph-machine" style={{height: 100}}  opts={{ renderer: "svg" }}/></td>

            <td className="row center small-gap">
                    {blocked ?
                        <button className="round-button black-back"
                                onClick={() => blockMachine(false)}
                                title="Unblock the machine"
                        >
                            <LockOpenIcon/>
                        </button> :
                        <button className="round-button"
                                onClick={() => blockMachine(true)}
                                title="Block the machine"
                        ><LockClosedIcon/>
                        </button>}

                    {deleted ?
                        <button className="round-button rotate270"
                                onClick={() => deleteMachine(false)}
                                title="Restore machine">
                            <ArrowForwardIcon />
                        </button> :
                        <button className="round-button cancel"
                                onClick={() => deleteMachine(true)}
                                title="Delete the machine"
                        >
                            <DeleteIcon />
                        </button>}
            </td>
        </tr>)
}

export default MachineItem;