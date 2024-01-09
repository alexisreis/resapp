import React, {FC} from "react";
import {Reservation} from "../shared/Reservation";

import laptop from "../assets/laptop.svg";
import calendar from "../assets/calendar.svg";
import time from "../assets/time.svg";
import cpu from "../assets/cpu.svg";
import ram from "../assets/ram.svg";
import gpu from "../assets/gpu.svg";
import {DeleteIcon} from "./SVGIcons";

interface ReservationItemProps {
    reservation: Reservation,
    deletable?: boolean,
    deleteReservation?: () => void
}

const ReservationItem: FC<ReservationItemProps> = ({reservation, deletable, deleteReservation}) => {

    const gpu_ram = reservation.gpu_ram_gb ? reservation.gpu_ram_gb.reduce(function (a, b) {
        return a + b;
    }, 0) : 0;

    const isSameDay =
        reservation.begin_date.toDateString() === reservation.ending_date.toDateString();

    const isToday =
        reservation.begin_date.toDateString() === new Date().toDateString();

    const timeDiff = reservation.begin_date.getTime() - new Date().getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let displayDate = "";
    if (isToday) {
        const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
        displayDate = `IN ${hoursDiff} HOURS`;
    } else {
        if (daysDiff < 2) {
            displayDate = `TOMORROW`;
        } else {
            displayDate = `IN ${daysDiff} DAYS`;
        }
    }


    return (<div className={`reservation-div ${!deletable ? "past" : ""}`}>

            {deletable ? <span className="reservation-status" style={{color: "green"}}>
                {displayDate}
            </span> : null}

            <div className="event-content-title-div">
                <span className="reservation-title">{reservation.task_name}</span>
                {deletable ?
                    <button className="round-button cancel" onClick={deleteReservation} title="Delete this reservation">
                        <DeleteIcon/>
                    </button> : null}
            </div>

            <div className="column small-gap">
                <div className="row align-center"><img src={laptop} className="reservation-icon"
                                                       alt=""/>{reservation.machine.name}</div>

                <div className="row align-center">
                    <img src={calendar} className="reservation-icon" alt=""/>
                    {isSameDay
                        ? `${reservation.begin_date.toDateString()}`
                        : `${reservation.begin_date.toDateString()} - ${reservation.begin_date.getHours()}:00`}
                </div>
                {
                    <div className="row align-center">
                        <img src={time} className="reservation-icon" alt=""/>
                        {isSameDay
                            ? `${reservation.begin_date.getHours()}:00 - ${reservation.ending_date.getHours()}:00`
                            : `${reservation.ending_date.toDateString()} - ${reservation.ending_date.getHours()}:00`}
                    </div>
                }
            </div>

            <hr/>

            <div className="column small-gap">
                <div className="row align-center"><img src={cpu} className="reservation-icon"
                                                       alt=""/> x {reservation.nb_cpu} CPU
                </div>
                <div className="row align-center"><img src={ram} className="reservation-icon"
                                                       alt=""/> {reservation.ram_gb}GB RAM
                </div>
                {gpu_ram ?
                    <div className="row align-center"><img src={gpu} className="reservation-icon" alt=""/> {gpu_ram}GB
                        GPU RAM</div> : null}
            </div>
        </div>
    )
}

export default ReservationItem;