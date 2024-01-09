import React, {createContext, useContext, useState, ReactNode, useMemo} from 'react';
import {User} from "../shared/User";
import {UserInfo} from "remult";

interface UserContextType {
    user: User | UserInfo | null;
    setUser: (user: User | UserInfo | null) => void;
}

const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => {
    },
});

type Props = {
    children: ReactNode;
}
const UserProvider = (props: Props) => {
    const [user, setUser] = useState<User | UserInfo | null>(null);
    const userProvider = useMemo(() => ({user, setUser}), [user, setUser])


    return (
        <UserContext.Provider value={userProvider}>
            {props.children}
        </UserContext.Provider>
    );
};

const useUser = () => useContext(UserContext);

export {UserProvider, useUser};