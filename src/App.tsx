import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {Helmet} from "react-helmet-async";

import ProtectedRoute from "./pages/ProtectedRoute";
import ReservationsPage from './pages/ReservationsPage';
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import Layout from './pages/Layout';

import {MachinesProvider} from "./utils/MachinesContext";
import {UserProvider} from "./utils/UserContext";

import './styles/App.css'


function App() {

    return (<>
        <Helmet>
            <meta
                httpEquiv="Content-Security-Policy"
                content={`
                  default-src 'self';
                  script-src 'self';
                  style-src 'self' 'unsafe-inline';
                  img-src 'self';
                  media-src 'self';
            `}
            ></meta>
        </Helmet>

        <UserProvider>
            <MachinesProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout/>}>
                            <Route element={<ProtectedRoute />}>
                                <Route path="/" element={<ReservationsPage/>}/>
                            </Route>

                            <Route element={<ProtectedRoute />}>
                                <Route path="/bookings" element={<MyBookingsPage/>}/>
                            </Route>

                            <Route element={<ProtectedRoute admin/>}>
                                <Route path="admin" element={<AdminPage />} />
                            </Route>

                            <Route path="/login" element={<LoginPage/>}/>

                            <Route path="*" element={<NotFoundPage/>} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </MachinesProvider>
        </UserProvider>
        </>

    )
}

export default App