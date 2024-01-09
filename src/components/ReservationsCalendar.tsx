import React, {FC} from 'react';
import {Calendar, momentLocalizer} from 'react-big-calendar';
import moment from 'moment';

import {Reservation} from "../shared/Reservation";
import ReservationEventItem from "./ReservationEventItem";

import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/Calendar.css'


moment.updateLocale('en', {week: {dow: 1}})
const localizer = momentLocalizer(moment);

interface ReservationsCalendarProps {
    reservations: Reservation[];
}

const ReservationsCalendar: FC<ReservationsCalendarProps> = ({reservations}) => {

    // Array of predefined colors
    const colors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];

    // Function to get a random color from the array of predefined colors
    const getColor = (reservation: Reservation) => {
        // Compute a hash of the event title
        let hash = 0;
        for (let i = 0; i < reservation.user.name.length; i++) {
            hash = (hash << 5) - hash + reservation.user.name.charCodeAt(i);
            hash |= 0;
        }

        // Use the hash to get a color from the array of predefined colors
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    // Map reservations to events
    const events = reservations.map(reservation => {
        // Get the reservation date
        const begin_date = moment(reservation.begin_date).toDate();
        const ending_date = moment(reservation.ending_date).toDate();

        return {
            title: reservation.user.account + " | " + reservation.task_name,
            start: begin_date,
            end: ending_date,
            allDay: false,
            color: getColor(reservation),
            reservation,
        };
    });

    const eventPropGetter = (event: any) => ({
        style: {
            backgroundColor: event.color,
            textShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)',
        },
    });

    const [selectedReservation, setSelectedReservation] = React.useState<Reservation | null>(null);
    const [selectedColor, setSelectedColor] = React.useState<string>("#000");

    const handleSelectEvent = (event: any) => {
        setFadeIn(false);

        setTimeout(() => {
            setSelectedReservation(event.reservation);
            setSelectedColor(event.color);
            setFadeIn(true)
        }, 300);
    }

    const [fadeIn, setFadeIn] = React.useState(false);


    return (
        <div className="calendar-container">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{height: "75vh", width: "90%", border: "1px solid lightgray", padding: "0.5em"}}
                eventPropGetter={eventPropGetter}
                onSelectEvent={handleSelectEvent}
            />

            {selectedReservation ?
                <ReservationEventItem
                    reservation={selectedReservation}
                    setSelectedReservation={setSelectedReservation}
                    fadeIn={fadeIn}
                    selectedColor={selectedColor}/>
                : null}
        </div>)
}

export default ReservationsCalendar;