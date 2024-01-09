import React, {ChangeEvent, FC, FormEvent, useState} from "react";

import PopUp from "./PopUp";
import {MachineController} from "../shared/MachineController";

import "../styles/PopUp.css"
import ErrorPopUp from "./ErrorPopUp";


interface AddMachinePopUpProps {
    setShowAddMachineForm: React.Dispatch<React.SetStateAction<boolean>>,
    setMachinesInfos: React.Dispatch<React.SetStateAction<any []>>
}

const AddMachinePopUp: FC<AddMachinePopUpProps> = ({setShowAddMachineForm, setMachinesInfos}) => {

    const [newMachine, setNewMachine] = useState<any>({
        name: '',
        nb_cpu: 1,
        ram_gb: 1,
        has_gpu: false,
    });

    const [prevGpu, setPrevGpu] = useState<any>({
        nb_gpu: 2,
        gpu_ram_gb: [16, 16]
    })

    const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
        setNewMachine((prevRes: any) => ({...prevRes, [e.target.name]: e.target.value}))

    const handleHasGpuChange = (e: ChangeEvent<HTMLInputElement>) => {

        setNewMachine((presRes: any) => {
            const has_gpu = e.target.value === "has_gpu_true";

            if (has_gpu) {
                return (
                    {
                        ...presRes,
                        ["has_gpu"]: true,
                        ["nb_gpu"]: prevGpu.nb_gpu,
                        ["gpu_ram_gb"]: prevGpu.gpu_ram_gb
                    });
            }

            const {nb_gpu, gpu_ram_gb, ...rest} = presRes;
            setPrevGpu({nb_gpu: nb_gpu, gpu_ram_gb: gpu_ram_gb})

            return ({...rest, ["has_gpu"]: false});
        })
    };

    const handleNbGpuChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newNbGpu = parseInt(e.target.value ? e.target.value : "0");
        if (!newNbGpu) return;

        let newGpuRamGb = [...newMachine.gpu_ram_gb];

        const arrayDiff = Math.abs(newNbGpu - newMachine.nb_gpu);
        if (newNbGpu > newMachine.nb_gpu) {
            for (let i = 0; i < arrayDiff; i++)
                newGpuRamGb.push(16);
        } else if (newNbGpu < newMachine.nb_gpu) {
            for (let i = 0; i < arrayDiff; i++)
                newGpuRamGb.pop();
        }

        setNewMachine((presRes: any) => ({...presRes, ["nb_gpu"]: newNbGpu, ["gpu_ram_gb"]: newGpuRamGb}));
    }

    const handleArrayChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const newGpuRamGb = [...newMachine.gpu_ram_gb];
        newGpuRamGb[index] = parseInt(e.target.value);

        setNewMachine((presRes: any) => ({...presRes, ["gpu_ram_gb"]: newGpuRamGb}));
    };

    const addMachine = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await MachineController.addMachine(newMachine)
                .then(() => {
                    setMachinesInfos((prevMachines: any) => [...prevMachines, {
                        ...newMachine,
                        used_cpu: 0,
                        used_ram: 0,
                        used_gpu: 0
                    }]);
                    setShowAddMachineForm(false);
                });
        } catch (error: any) {
            setError(error.message)
        }
    }

    const [error, setError] = useState<string>('')

    return <PopUp>
        <form onSubmit={addMachine} className="scrollable">
            <h2>Add a machine</h2>

            <div>
                <label htmlFor="name">Its name</label>
                <input type="text" id="name" name="name" placeholder="Machine name" onChange={handleChange}
                       onKeyDown={(e) => {
                           e.key === 'Enter' && e.preventDefault()
                       }}/>
            </div>

            <div className="row small-gap">
                <div>
                    <label htmlFor="nb_cpu">With how many CPUs ?</label>
                    <input type="number" id="nb_cpu" name="nb_cpu" value={newMachine.nb_cpu} min="1"
                           onChange={handleChange} onKeyDown={(e) => {
                        e.key === 'Enter' && e.preventDefault()
                    }}/>
                </div>
                <div>
                    <label htmlFor="ram_gb">And how much RAM (GB) ?</label>
                    <input type="number" id="ram_gb" name="ram_gb" value={newMachine.ram_gb} min="1"
                           onChange={handleChange} onKeyDown={(e) => {
                        e.key === 'Enter' && e.preventDefault()
                    }}/>
                </div>
            </div>

            <div className="row center small-gap">
                <label htmlFor="has_gpu">Does it have GPUs ?</label>
                <p>
                    Yes
                    <input
                        type="radio"
                        name="has_gpu"
                        value="has_gpu_true"
                        checked={newMachine.has_gpu}
                        onChange={handleHasGpuChange}
                    />
                </p>
                <p>
                    No
                    <input
                        type="radio"
                        name="has_gpu"
                        value="has_gpu_false"
                        checked={!newMachine.has_gpu}
                        onChange={handleHasGpuChange}
                    />
                </p>
            </div>

            {newMachine.has_gpu && <div className="row small-gap">
                <div>
                    <label htmlFor="gpu_ram_gb">How many GPU cores ?</label>
                    <input type="number" id="nb_gpu" name="nb_gpu" placeholder="0, 1, 2 ?" min="1"
                           value={newMachine.nb_gpu}
                           onChange={handleNbGpuChange} onKeyDown={(e) => {
                        e.key === 'Enter' && e.preventDefault()
                    }}/>
                </div>
                <div>
                    <label htmlFor="gpu_ram_gb">How much RAM per GPU (GB) ?</label>
                    {newMachine.gpu_ram_gb.map((value: number, index: number) => (
                        <label key={index}>
                            GPU {index + 1} RAM:
                            <input
                                type="number"
                                value={value}
                                onChange={(event) => handleArrayChange(index, event)}
                                onKeyDown={(e) => {
                                    e.key === 'Enter' && e.preventDefault()
                                }}
                            />
                        </label>
                    ))}
                </div>
            </div>}


            <button className="main-button" type="submit" title="Add a machine">
                <span className="button-icon">+</span>
                Add a machine
            </button>
            <button className="cancel-button" onClick={() => setShowAddMachineForm(false)}>Cancel</button>
        </form>

        {error && <ErrorPopUp key={error} type={"ERROR"} message={error} setMessage={setError}/>}

    </PopUp>
}

export default AddMachinePopUp;