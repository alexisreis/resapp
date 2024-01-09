import React from "react";

import {useUser} from "../utils/UserContext";
import {ReservationController} from "../shared/ReservationController";
import {User} from "../shared/User";
import {Machine} from "../shared/Machine";

interface BookMachineProps {
    machine: Machine;
    isFree: boolean;
    availableGpusRam?: number[];
    selectedStartTime: Date;
    request: any;
    setShowAddReservationForm: React.Dispatch<React.SetStateAction<boolean>>
}

const BookMachineItem: React.FC<BookMachineProps> = ({machine, isFree, availableGpusRam, selectedStartTime, request, setShowAddReservationForm}) => {

    const {user} = useUser();
    const bookReservation = async () => {

        let ending_date = new Date(selectedStartTime);
        ending_date.setHours(ending_date.getHours() + Number(request.duration));

        try {
            await ReservationController.addReservation({
                task_name: request.task_name,
                user: user as User,
                machine: machine,
                begin_date: new Date(selectedStartTime),
                ending_date: ending_date,
                nb_cpu: request.nb_cpu,
                ram_gb: request.ram_gb,
                gpu_ram_gb: availableGpusRam ? availableGpusRam : undefined,
            }).then(() => {
                setShowAddReservationForm(false);
            });
        } catch (error: any) {
            alert(error.message)
        }
    }

    return (<div className="book-machine">
        <h4>{machine.name}</h4>
        <div className="row-space-between">
            <div className="row center">
                {/*{ availableGpusRam && <p>{availableGpusRam.toString()}</p>}*/}
            <span
                style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    marginRight: 10,
                    borderRadius: 5,
                    backgroundColor: isFree ? 'green' : 'orange',
                }}
            />
                <span
                    className={`${isFree ? 'green' : 'orange'} 'machine-status-span'`}>{isFree ? 'Free' : 'Shared'}</span>
            </div>

            <button className="main-button"
                    onClick={bookReservation}
                    title={"Book " + machine.name}>Book</button>
        </div>
    </div>)
}

export default BookMachineItem;