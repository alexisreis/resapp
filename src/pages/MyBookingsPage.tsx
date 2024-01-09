import React, {FC, useEffect, useState} from "react";
import {remult} from "remult";

import {Reservation} from "../shared/Reservation";
import {ReservationController} from "../shared/ReservationController";
import {useUser} from "../utils/UserContext";

import ReservationItem from "../components/ReservationItem";

const reservationRepo = remult.repo(Reservation);

const MyBookingsPage: FC = () => {

    const [userNextReservations, setUserNextReservations] = useState<Reservation[]>([]);
    const [userPastReservations, setUserPastReservations] = useState<Reservation[]>([]);

    const {user} = useUser();

    const deleteReservation = async (reservation: Reservation, array: Reservation[], setArray:  React.Dispatch<React.SetStateAction<Reservation[]>>) => {
        if (reservation && confirm('Are you sure you want to delete this reservation?')) {
            try {
                await ReservationController.deleteReservation(reservation)
                    .then (() => {
                        const index = array.findIndex((res) => res.id === reservation.id);
                        if (index > -1) {
                            setArray([...array.slice(0, index), ...array.slice(index + 1)]);
                        }
                    })
            } catch (error: any) {
                alert(error.message)
            }
        }
    }

    const fetchUserReservations = async () => {
        const next = user?.id && await reservationRepo.find({
            where: {user: {$id: user.id}, begin_date: {$gte: new Date()}},
            orderBy: {begin_date: 'asc'},
        });
        setUserNextReservations(next ? next : []);

        const past = user?.id && await reservationRepo.find({
            where: {user: {$id: user.id}, begin_date: {$lt: new Date()}},
            orderBy: {begin_date: 'desc'},
        });
        setUserPastReservations(past ? past : []);
    }

    useEffect(() => {
        fetchUserReservations();
    }, []);

    return (<>
        <h2>Next bookings</h2>
        <div className="row small-gap" style={{overflowX: "auto", padding: 2, gap: "2em"}}>
            {userNextReservations.length > 0 ?
                userNextReservations
                    .map((res) => <ReservationItem key={res.id} reservation={res} deletable deleteReservation={() => deleteReservation(res, userNextReservations, setUserNextReservations)}/>
                    )
                :
                <p>You have no next bookings</p>}
        </div>

        <h2>Past bookings</h2>
        <div className="row" style={{overflowX: "auto", padding: 2, gap: "2em"}}>
            {userPastReservations.length > 0 ?
                userPastReservations
                    .map((res) => <ReservationItem key={res.id} reservation={res}/>
                    )
                :
                <p>You have no past bookings</p>}
        </div>

    </>);
}

export default MyBookingsPage;