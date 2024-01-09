import React, {FC, useEffect, useMemo, useState} from "react";
import {remult} from "remult";
import {NavLink} from "react-router-dom";

import {useUser} from "../utils/UserContext";

import {SignOutIcon} from "./SVGIcons";

import "../styles/Navbar.css"
import ReactSwitch from "react-switch";
import {useMediaQuery} from "react-responsive";


const Navbar: FC = () => {

    const {user, setUser} = useUser();
    const [isDark, setIsDark] = useState(false);

    const systemPrefersDark = useMediaQuery(
        {
            query: "(prefers-color-scheme: dark)",
        },
        undefined,
    );



    const theme = useMemo(
        () =>
            window.localStorage.getItem("theme")
                ? window.localStorage.getItem("theme")
                : systemPrefersDark
                    ? "dark"
                    : "light",
        [window.localStorage.getItem("theme"), systemPrefersDark]
    );

    const getPreferredTheme = () => {
        if (window.localStorage.getItem("theme") === null) {
            window.localStorage.setItem("theme", theme as string);
        }

        setIsDark(theme === "dark");

        if (theme === "dark") {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
    };

    const changeTheme = () => {
        const theme = isDark ? "light" : "dark";
        setIsDark(!isDark);

        if (theme === "dark") {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }

        window.localStorage.setItem("theme", theme);
    }

    useEffect(() => {
        getPreferredTheme();
    }, []);

    const signOut = async () => {
        try {
            await fetch('/api/signOut', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            })

            remult.user = undefined;
            setUser(null);

        } catch (e) {
            console.log("sign_out_catch_error", e);
        }
    }

    return (<nav className="nav-div">
        <NavLink to="/" className="nav-link">
            <div className="row small-gap center">
                <img src="/calendar.svg" alt="Resources Reservation App logo" id="app-logo"/>
                <h2 id="app-title">Resapp</h2>
            </div>
        </NavLink>


        {user &&
            <div className="row-space-between">
                <div className="row small-gap">
                    <NavLink className={({isActive}) =>
                        `${isActive ? "nav-link-active" : ''} nav-link`
                    } to="/">
                        <p>Calendar</p>
                    </NavLink>

                    <NavLink className={({isActive}) =>
                        `${isActive ? "nav-link-active" : ''} nav-link`
                    } to="/bookings">
                        <p>My bookings</p>
                    </NavLink>

                    {user.isAdmin &&
                        <NavLink className={({isActive}) =>
                            `${isActive ? "nav-link-active" : ''} nav-link`}
                                 to="/admin">
                            <p>Admin dashboard</p>
                        </NavLink>}
                </div>

                <div className="row center small-gap">
                    <ReactSwitch
                        checked={isDark}
                        onChange={changeTheme}
                        onColor="#44bdaa"
                        onHandleColor="#999"
                        offHandleColor="#fff"
                        handleDiameter={24}
                        uncheckedIcon={ <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                                fontSize: 16,
                                color: "#ffbb22",
                            }}
                        >
                            ☀
                        </div>}
                        checkedIcon={<div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                                fontSize: 16,
                                color: "#ffbb22",
                            }}
                        >
                            🌙
                        </div>}
                    />
                    <p>{user.name}</p>
                    <NavLink className="round-button cancel" to="/login" onClick={signOut} title="Sign-out">
                            <SignOutIcon/>
                    </NavLink>
                </div>
            </div>}

    </nav>)
}

export default Navbar;