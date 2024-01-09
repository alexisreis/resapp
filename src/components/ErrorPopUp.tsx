import React, {FC, useState, useEffect} from "react";

import "../styles/ErrorPopUp.css"

interface ErrorPopUpProps {
    type: "WARNING" | "ERROR";
    message: string;
    setMessage?: React.Dispatch<React.SetStateAction<string>>;
}

const ErrorPopUp: FC<ErrorPopUpProps> = ({type, message, setMessage}) => {

    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
            setMessage && setMessage('');
        }, 5000);
        return () => clearTimeout(timer);
    }, [setMessage]);

    const errorBackgroundColor = type === 'WARNING' ? 'rgba(251,243,219,1)' : 'rgba(253,235,236,1)';
    const errorColor = type === 'WARNING' ? 'orange' : 'red';

    return (show ? (
        <div className="error-popup" style={{backgroundColor: errorBackgroundColor}}>
            <div
                className="event-details-header"
                style={{
                    backgroundColor: errorColor,
                    animation: `loading-bar 5s linear`,
                }}
            />
            <div className="error-popup-content">
                <div style={{ marginRight: 10 }}>
                    {/* Replace with your error icon */}
                    {type === 'WARNING' ? '⚠️' : '❌'}
                </div>
                <div className="error-message">{message}</div>
            </div>
        </div>) : null)
}

export default ErrorPopUp;