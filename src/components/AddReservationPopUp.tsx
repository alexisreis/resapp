import React, {ChangeEvent, FC, FormEvent, useState} from "react";

import PopUp from "./PopUp";
import {ReservationController} from "../shared/ReservationController";
import {Machine} from "../shared/Machine";


import TimeSelector from "./TimeSelector";
import ErrorPopUp from "./ErrorPopUp";


interface PossibleReservation {
    start_time: Date;
    possibleReservations: {
        machine: Machine;
        isFree: boolean;
    }[];
}


interface AddReservationPopUpProps {
    setShowAddReservationForm: React.Dispatch<React.SetStateAction<boolean>>
}

const AddReservationPopUp: FC<AddReservationPopUpProps> = ({setShowAddReservationForm}) => {

    const [error, setError] = useState<string>('');
    const formattedDate = (date: Date) =>
        date.toLocaleString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(', ', 'T').slice(0, 16);


    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const [step, setStep] = useState(1);
    const [needGPU, setNeedGPU] = useState(false);
    const [oldGPU, setOldGPU] = useState(1);

    const [request, setRequest] = useState({
        task_name: "",
        begin_date: now,
        ending_date: oneHourLater,
        duration: "1",
        nb_cpu: "1",
        ram_gb: "1",
        gpu_ram_gb: "0",
    });

    const [possibleReservations, setPossibleReservations] = useState<PossibleReservation[]>([]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.type === "datetime-local") {
            setRequest(prevRes => ({...prevRes, [e.target.name]: new Date(e.target.value)}))
        } else {
            setRequest(prevRes => ({...prevRes, [e.target.name]: e.target.value}))
        }
    }

    const requestResources = async (e: FormEvent) => {
        e.preventDefault();

        if (!request.task_name || !request.begin_date || !request.ending_date || !request.duration || !request.nb_cpu || !request.ram_gb) {
            setError('Please fill all the fields');
            return;
        }

        if (request.begin_date > request.ending_date) {
            setError('The ending must be after the beginning');
            return;
        }

        if (parseInt(request.duration) < 1) {
            setError('The duration cannot be less than 1 hour');
            return;
        }

        if (parseInt(request.duration) > Math.abs(request.ending_date.getTime() - request.begin_date.getTime()) / (1000 * 60 * 60)) {
            setError('The duration cannot be longer than the time between the beginning and the ending');
            return;
        }

        try {
            await ReservationController.requestResources(
                new Date(request.begin_date),
                new Date(request.ending_date),
                parseInt(request.duration),
                request.task_name,
                parseInt(request.nb_cpu),
                parseInt(request.ram_gb),
                parseInt(request.gpu_ram_gb),
            ).then((res) => {
                setPossibleReservations(res);
                setStep(2);
            });
        } catch (error: any) {
            setError(error.message)
        }

    }


    return <PopUp>
        <form onSubmit={requestResources} className="scrollable">
            <h2>Request resources</h2>
            {step === 1 && <>
                <div className="column small-gap" style={{marginBottom: "1em"}}>
                    <h2 className="form-section-title">When ?</h2>

                    <div className="row-space-between">
                        <label htmlFor="begin_date">Between :</label>
                        <input
                            type="datetime-local"
                            name="begin_date"
                            min={formattedDate(now)}
                            value={formattedDate(request.begin_date)}
                            onKeyDown={(e) => {
                                e.key === 'Enter' && e.preventDefault()
                            }}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="row-space-between">
                        <label htmlFor="ending_date">And :</label>
                        <input
                            type="datetime-local"
                            name="ending_date"
                            min={formattedDate(new Date(request.begin_date.getTime() + 60 * 60 * 1000))}
                            max={formattedDate(new Date(request.begin_date.getTime() + 60 * 60 * 1000 + 30 * 24 * 60 * 60 * 1000))}
                            value={formattedDate(request.ending_date)}
                            onKeyDown={(e) => {
                                e.key === 'Enter' && e.preventDefault()
                            }}
                            onChange={handleChange}
                        />
                    </div>


                    <div className="row-space-between center">
                        <label htmlFor="nb_cpu">How many hours do you need ?</label>
                        <input type="number" name="duration" min="1"
                               max={Math.abs(request.ending_date.getTime() - request.begin_date.getTime()) / (1000 * 60 * 60)}
                               onChange={handleChange}
                               onKeyDown={(e) => {
                                   e.key === 'Enter' && e.preventDefault()
                               }}
                               value={request.duration}
                               placeholder="Hours needed"/>
                    </div>

                    <hr/>

                    <div className="column small-gap">
                        <h2 className="form-section-title">Resources</h2>
                        <div className="row-space-between">
                            <label htmlFor="nb_cpu">Number of CPU : </label>
                            <input type="number" name="nb_cpu" min="1" max="8"
                                   value={request.nb_cpu}
                                   onChange={handleChange}
                                   onKeyDown={(e) => {
                                       e.key === 'Enter' && e.preventDefault()
                                   }}
                                   placeholder="Number of CPU"/>
                        </div>

                        <div className="row-space-between">
                            <label htmlFor="ram_gb">RAM (GB) : </label>
                            <input type="number" name="ram_gb" min="1" max="128"
                                   onChange={handleChange}
                                   onKeyDown={(e) => {
                                       e.key === 'Enter' && e.preventDefault()
                                   }}
                                   value={request.ram_gb}
                                   placeholder="RAM (GB)"/>
                        </div>

                    </div>


                    <div className="row-space-between">

                        <label htmlFor="gpu_ram_gb">Do you need GPU ?</label>
                        <div className="row">
                            <p>
                                Yes
                                <input
                                    type="radio"
                                    name="has_gpu"
                                    value="has_gpu_true"
                                    checked={needGPU}
                                    onChange={() => {
                                        setNeedGPU(true)
                                        setRequest(prevRes => ({...prevRes, gpu_ram_gb: oldGPU.toString()}))
                                    }}
                                />
                            </p>
                            <p>
                                No
                                <input
                                    type="radio"
                                    name="has_gpu"
                                    value="has_gpu_false"
                                    checked={!needGPU}
                                    onChange={() => {
                                        setNeedGPU(false)
                                        setOldGPU(parseInt(request.gpu_ram_gb));
                                        setRequest(prevRes => ({...prevRes, gpu_ram_gb: "0"}))
                                    }}
                                />
                            </p>
                        </div>
                    </div>

                    {needGPU && <div className="row-space-between">
                        <label htmlFor="gpu_ram_gb">If so, how many (in GB of RAM)?</label>
                        <input type="number" name="gpu_ram_gb" min="1"
                               onChange={handleChange}
                               onKeyDown={(e) => {
                                   e.key === 'Enter' && e.preventDefault()
                               }}
                               value={request.gpu_ram_gb}
                               placeholder="GPU RAM (GB)"/>
                    </div>
                    }

                    <hr/>

                    <div>
                        <label htmlFor="taskName">Why do you need these resources ?</label>
                        <input
                            type="text"
                            name="task_name"
                            placeholder="My task..."
                            onKeyDown={(e) => {
                                e.key === 'Enter' && e.preventDefault()
                            }}
                            onChange={handleChange}
                            value={request.task_name}
                        />
                    </div>
                </div>

                <button className="main-button" type="submit">
                    <span className="button-icon">+</span>
                    See available slots
                </button>
            </>
            }

            {step === 2 && <>
                <TimeSelector possibleReservations={possibleReservations} request={request}
                              setShowAddReservationForm={setShowAddReservationForm}/>
                <button className="cancel-button"
                        title={"Go back to the form"}
                        onClick={() => setStep(step - 1)}>Go back</button>
            </>}

            <button className="cancel-button"
                    title={"Close the form"}
                    onClick={() => setShowAddReservationForm(false)}>Close</button>
        </form>

        {error && <ErrorPopUp type={"ERROR"} message={error} setMessage={setError}/>}
    </PopUp>
}

export default AddReservationPopUp;