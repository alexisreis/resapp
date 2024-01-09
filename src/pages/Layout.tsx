import { FC } from "react"
import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar";

const Layout: FC = () => {

    return (<>
            <Navbar />
            <main className="App">
                <Outlet />
            </main>
        </>)
}


export default Layout