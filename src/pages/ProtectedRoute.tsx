import React, {FC, ReactElement} from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import {useUser} from "../utils/UserContext";

interface ProtectedRouteProps {
    admin?: boolean;
    redirectPath?: string;
    children?: ReactElement | null;
}

const ProtectedRoute : FC <ProtectedRouteProps>  = ({
                            admin = false,
                            redirectPath = '/login',
                            children,
                        }) => {

    const {user} = useUser();

    if (!user || (admin && !(user?.isAdmin))) {
        return <Navigate to={redirectPath} replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;