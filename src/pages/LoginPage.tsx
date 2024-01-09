import React, {FC, FormEvent, useEffect, useState} from "react";
import {remult} from "remult";
import {useNavigate} from "react-router-dom";

import {useUser} from "../utils/UserContext";
import ErrorPopUp from "../components/ErrorPopUp";


const LoginPage: FC = () => {

    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    const [error, setError] = useState<string>('')

    const {user, setUser} = useUser();
    const navigate = useNavigate();

    const signIn = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const result = await fetch('/api/signIn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username, password})
            })
            if(result.ok){
                const user = await result.json();
                setUser(user);
                remult.user = user;
                navigate('/');
            }
            else {
                const error = await result.json();
                setError(error.error);
            }
        } catch (e) {
            console.log("sign_in_catch_error", e);
        }
    }

    useEffect(() => {
        if(user !== null) return;

        fetch("/api/currentUser").then(async r => {
            remult.user = await r.json();
            if (remult.user) {
                setUser(remult.user);
                navigate('/');
            }
        })
    }, [])

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={signIn}>
                <label>USERNAME</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}/>

                <label>PASSWORD</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>

                <input type="submit" className="main-button" value="Login" onClick={signIn}/>
            </form>

            {error && <ErrorPopUp key={error} type={"ERROR"} message={error} setMessage={setError}/>}

        </div>
    )
}

export default LoginPage;