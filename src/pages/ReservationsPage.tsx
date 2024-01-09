import React, {FC, useEffect, useState} from "react";
import {remult} from "remult";
import ReactSwitch from "react-switch";

import {Reservation} from "../shared/Reservation";
import {useUser} from "../utils/UserContext";

import ReservationsCalendar from "../components/ReservationsCalendar";
import AddReservationPopUp from "../components/AddReservationPopUp";

import "../styles/Reservation.css"


const reservationRepo = remult.repo(Reservation);
const ReservationsPage: FC = () => {

    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [showAddReservationForm, setShowAddReservationForm] = useState<boolean>(false);
    const {user} = useUser();

    const [showOnlyMyReservations, setShowOnlyMyReservations] = useState(false);

    const handleOptionChange = (checked: boolean) => {
        setShowOnlyMyReservations(checked);
    };

    const filteredReservations =
        !showOnlyMyReservations
            ? reservations
            : reservations.filter((res) => res.user.id === user?.id);


    useEffect(() => {
        return reservationRepo
            .liveQuery({
                orderBy: {begin_date: 'desc'},
            })
            .subscribe(info => setReservations(info.applyChanges))
    }, [])

    return (<>

        <div>
            <div className="calendar-header">
                <button style={{marginTop: 0}}
                        className="main-button"
                        onClick={() => setShowAddReservationForm(true)}
                        title="Add a reservation">
                    <span className="button-icon">+</span>
                    Add a reservation
                </button>

                <div id="calendar-menu">
                    <span>All reservations</span>
                    <ReactSwitch checked={showOnlyMyReservations} onChange={handleOptionChange} checkedIcon={false} uncheckedIcon={false} onColor={"#44bdaa"}/>
                    <span>My reservations only</span>
                </div>

            </div>

            <ReservationsCalendar reservations={filteredReservations}/>
        </div>


        {showAddReservationForm && <AddReservationPopUp setShowAddReservationForm={setShowAddReservationForm}/>}

    </>);
}

export default ReservationsPage; 