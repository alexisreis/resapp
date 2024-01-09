import React, {useState} from 'react';

import {Machine} from "../shared/Machine";
import BookMachineItem from "./BookMachineItem";

import arrowBack from "../assets/arrow-back.svg";
import arrowForward from "../assets/arrow-forward.svg";
import "../styles/TimeSelector.css";


interface PossibleReservation {
    machine: Machine;
    isFree: boolean;
    availableGpusRam?: number[];
}

interface TimeSelectorProps {
    possibleReservations: {
        start_time: Date;
        possibleReservations: PossibleReservation[];
    }[];
    request: any;
    setShowAddReservationForm: React.Dispatch<React.SetStateAction<boolean>>
}

const TimeSelector: React.FC<TimeSelectorProps> = ({possibleReservations, request, setShowAddReservationForm}) => {

    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);

    const days = Array.from(new Set(possibleReservations.map(({start_time}) => new Date(start_time).toDateString())));
    const selectedDay = days[selectedDayIndex];
    const reservationsForSelectedDay = possibleReservations.filter(({start_time}) => new Date(start_time).toDateString() === selectedDay);

    const handleClick = (start_time: Date | undefined) => {
        if (start_time) {
            setSelectedStartTime(start_time);
        }
    };

    let firstHour: number
    let lastHour: number;
    let hours: number[] = [];

    if (reservationsForSelectedDay.length > 0) {
        firstHour = new Date(reservationsForSelectedDay[0].start_time).getHours();
        lastHour = new Date(reservationsForSelectedDay[reservationsForSelectedDay.length - 1].start_time).getHours();
        hours = Array.from({length: lastHour - firstHour + 1}, (_, i) => firstHour + i);
    }


    return (
        <div style={{margin: "1em", maxWidth: "500px"}}>
            {possibleReservations.length > 0 ? <>
                <div className="row center">

                    <button
                        className="hour clickable-hour"
                        disabled={selectedDayIndex === 0}
                        onClick={() => {
                            setSelectedDayIndex(i => Math.max(i - 1, 0));
                            setSelectedStartTime(null);
                        }}
                        title="See previous day">
                        <img src={arrowBack} style={{width: "20px"}} alt=""/>
                    </button>

                    <span className="day-span">{selectedDay}</span>

                    <button
                        className="hour clickable-hour"
                        disabled={selectedDayIndex === days.length - 1}
                        onClick={() => {
                            setSelectedDayIndex(i => Math.min(i + 1, days.length - 1))
                            setSelectedStartTime(null);
                        }}
                        title="See the next day">
                        <img src={arrowForward} style={{width: "20px"}} alt=""/>
                    </button>
                </div>

                {reservationsForSelectedDay.length > 0 ? (<>

                    <h3>When would you like to start ?</h3>

                    <div className="row hour-selector">
                        {hours.map(hour => {

                            const reservation = reservationsForSelectedDay.find(
                                ({start_time}) => new Date(start_time).getHours() === hour
                            );

                            const isSelected = reservation && selectedStartTime === reservation.start_time;

                            return (
                                <button
                                    key={hour}
                                    onClick={() => handleClick(reservation && reservation.start_time)}
                                    className={`${reservation ? 'clickable-hour' : ''} ${isSelected ? 'selected-hour' : ''} hour`}
                                    title={reservation ? 'Click to see available slots at ' + hour + ':00' : 'No machines available this hour'}
                                >
                                    <span className="hour-span">{hour}:00</span>
                                </button>
                            );
                        })}
                    </div>

                    {selectedStartTime && (
                        <div className="column">
                            <h3>Bookable machines for {new Date(selectedStartTime).getHours()}:00
                                - {new Date(new Date(selectedStartTime).getTime() + Number(request.duration) * 60 * 60 * 1000).getHours()}:00</h3>

                            {reservationsForSelectedDay
                                .find(({start_time}) => start_time === selectedStartTime)
                                ?.possibleReservations.map(({machine, isFree, availableGpusRam}) => (
                                    <BookMachineItem machine={machine}
                                                     isFree={isFree}
                                                     availableGpusRam={availableGpusRam && availableGpusRam}
                                                     selectedStartTime={selectedStartTime}
                                                     request={request}
                                                     setShowAddReservationForm={setShowAddReservationForm}
                                                     key={machine.id}/>
                                ))}
                        </div>
                    )}
                </>) : <p>No machines available this day</p>}
            </> : <h3>No available machines for this request</h3>}
        </div>
    );
};


export default TimeSelector;