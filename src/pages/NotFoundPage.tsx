import React, {FC} from "react";
import {useNavigate} from "react-router-dom";

const NotFoundPage: FC = () => {

    const navigate = useNavigate();

    return (<>
            <h2>404 - This page does not exists</h2>
            <button className="main-button" onClick={() => navigate("/")}>Go back to home</button>
    </>);
}

export default NotFoundPage;