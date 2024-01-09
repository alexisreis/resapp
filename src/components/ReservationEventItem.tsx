import React, {FC} from "react";
import {ReservationController} from "../shared/ReservationController";
import {Reservation} from "../shared/Reservation";

import person from "../assets/person.svg";
import laptop from "../assets/laptop.svg";
import calendar from "../assets/calendar.svg";
import time from "../assets/time.svg";
import cpu from "../assets/cpu.svg";
import ram from "../assets/ram.svg";
import gpu from "../assets/gpu.svg";
import {CloseIcon, DeleteIcon} from "./SVGIcons";
import {useUser} from "../utils/UserContext";

interface ReservationEventItemProps {
    reservation: Reservation,
    setSelectedReservation: React.Dispatch<React.SetStateAction<Reservation | null>>,
    fadeIn: boolean,
    selectedColor: string
}

const ReservationEventItem: FC<ReservationEventItemProps> = ({
                                                                 reservation,
                                                                 setSelectedReservation,
                                                                 fadeIn,
                                                                 selectedColor
                                                             }) => {

    const deleteReservation = async () => {
        if (reservation && confirm('Are you sure you want to delete this reservation?')) {
            await ReservationController.deleteReservation(reservation);
            setSelectedReservation(null);
        }
    }

    const {user} = useUser();

    const gpu_ram = reservation.gpu_ram_gb ? reservation.gpu_ram_gb.reduce(function (a, b) {
        return a + b;
    }, 0) : 0;

    const isSameDay =
        reservation.begin_date.toDateString() === reservation.ending_date.toDateString();

    return (<div className={`event-details ${fadeIn ? 'fade-in' : 'fade-out'}`}>
            <div className="event-details-header" style={{backgroundColor: selectedColor}}></div>

            <div className="event-content">
                <div className="event-content-title-div">
                    <span className="reservation-title">{reservation.task_name}</span>
                    <div className="event-buttons-div">

                        {user?.isAdmin || reservation.user.id === user?.id ?
                            <button className="round-button cancel" onClick={deleteReservation}
                                    title="Delete this reservation">
                                <DeleteIcon/>
                            </button> : null}

                        <button className="round-button" onClick={() => setSelectedReservation(null)} title="Close">
                            <CloseIcon/>
                        </button>
                    </div>
                </div>

                <div className="column small-gap">

                    <div className="row align-center"><img src={person} className="reservation-icon"
                                                           alt=""/>{reservation.user.account}</div>
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
        </div>
    )
}

export default ReservationEventItem;