import React, {FC, useEffect, useState} from "react";
import ReactECharts from 'echarts-for-react';

import {ReservationController} from "../shared/ReservationController";

import arrowBack from "../assets/arrow-back.svg";
import arrowForward from "../assets/arrow-forward.svg";

import "../styles/GraphReservationWeek.css"


interface MachineStats {
    week: string;
    machinesNames: string[];
    numberOfReservationsPerMachine: number[];
    numberOfHoursPerMachine: number[];
    totalNumberOfReservations: number,
    meanDuration: number
}


const GraphReservationWeek: FC = () => {
    const [weeksPrior, setWeeksPrior] = useState<number>(0);
    const [machineStats, setMachineStats] = useState<MachineStats>({
        week: "",
        machinesNames: [],
        numberOfReservationsPerMachine: [],
        numberOfHoursPerMachine: [],
        totalNumberOfReservations: 0,
        meanDuration: 0
    });
    const [weekData, setWeekData] = useState<{ [key: number]: MachineStats }>({});

    const config = {
        rotate: 90,
        align: 'left',
        verticalAlign: 'middle',
        position: 'insideBottom',
        distance: 15,
    };

    type BarLabelOption = NonNullable<echarts.BarSeriesOption['label']>;

    const reservationLabel: BarLabelOption = {
        show: true,
        position: config.position as BarLabelOption['position'],
        distance: config.distance as BarLabelOption['distance'],
        align: config.align as BarLabelOption['align'],
        verticalAlign: config.verticalAlign as BarLabelOption['verticalAlign'],
        rotate: config.rotate as BarLabelOption['rotate'],
        formatter: '{c}  reservations',
        fontSize: 14,
        rich: {
            name: {}
        }
    };

    const hoursLabel: BarLabelOption = {
        show: true,
        position: config.position as BarLabelOption['position'],
        distance: config.distance as BarLabelOption['distance'],
        align: config.align as BarLabelOption['align'],
        verticalAlign: config.verticalAlign as BarLabelOption['verticalAlign'],
        rotate: config.rotate as BarLabelOption['rotate'],
        formatter: '{c} h  used',
        fontSize: 14,
        rich: {
            name: {}
        }
    };

    const option = {
        xAxis: {
            data: machineStats.machinesNames,
            axisLabel: {
                interval: 0,
                rotate: 30
            }
        },
        yAxis: {
            min: 0,
        },
        legend: {
            data: ["Reservations", "Hours"],
            align: "left",
        },
        tooltip: {

        },
        series: [
            {
                name: "Reservations",
                type: "bar",
                data: machineStats.numberOfReservationsPerMachine,
                itemStyle: {
                    color: "#69efce",
                },
                label: reservationLabel,
                emphasis: {
                    focus: 'series'
                },
            },
            {
                name: "Hours",
                type: "bar",
                data: machineStats.numberOfHoursPerMachine,
                itemStyle: {
                    color: "#888",
                },
                label: hoursLabel,
                emphasis: {
                    focus: 'series'
                },
            },
        ],
    };

    useEffect(() => {
        if (weekData[weeksPrior]) {
            setMachineStats(weekData[weeksPrior]);
        } else {
            ReservationController.getNumberOfReservationPerMachinePerWeek(
                weeksPrior
            ).then((data) => {
                setMachineStats(data);
                setWeekData((prevData) => ({ ...prevData, [weeksPrior]: data }));
            });
        }
    }, [weeksPrior]);

    return (
        <div className="column">
            <div className="row center">

                <button
                    className="hour clickable-hour"
                    onClick={() => setWeeksPrior((prev) => prev + 1)}
                    title="Go to previous week stats">
                    <img src={arrowBack} className="arrow-icon" alt=""/>
                </button>

                <div className="column center day-span-div">
                    <span className="day-span">{weeksPrior === 0 ? "This week" : weeksPrior === 1 ? "1 week before" :  `${weeksPrior} weeks before`}</span>
                    <span>{machineStats.week}</span>
                </div>

                <button
                    className="hour clickable-hour"
                    disabled={weeksPrior === 0}
                    onClick={() => setWeeksPrior((prev) => prev - 1)}
                    title="Go to next week stats">
                    <img src={arrowForward} className="arrow-icon" alt=""/>
                </button>
            </div>

            {machineStats.totalNumberOfReservations !== 0 ?
                <div className="row">
                    <ReactECharts
                        option={option}
                        className="graph"
                        opts={{ renderer: "svg" }}
                    />
                    <div className="column small-gap">
                        <div className="stat-div">
                            <h4>Total number of reservations</h4>
                            <h2>{machineStats.totalNumberOfReservations}</h2>
                        </div>

                        <div className="stat-div">
                            <h4>Mean duration</h4>
                            <h2>{machineStats.meanDuration} hours</h2>
                        </div>
                    </div>
                </div>
                :
                <div className="column center">
                    <h3>No reservations for this week</h3>
                </div>
            }

        </div>
    );
};

export default GraphReservationWeek;