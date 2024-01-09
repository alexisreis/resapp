import React, {FC} from 'react';

import "../styles/PopUp.css"
interface PopUpProps {
    children: React.ReactNode;
}

const PopUp: FC<PopUpProps> = ({children}) => {
    return (
        <div className="popup-container">
            <div className="popup-overlay" />
            <div className="popup-content">{children}</div>
        </div>
    );
}

export default PopUp;