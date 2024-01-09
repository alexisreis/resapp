import express from 'express';
import path from 'path';
import session from "cookie-session"
import {secrets} from "docker-secret";

import { api } from './api';
import { auth } from './auth';

// Check if environment variables are set
// If not, stop the server
if(!process.env["ENV"]|| !process.env["DEFAULT_ADMIN_ACCOUNT"] || !process.env["DEFAULT_ADMIN_NAME"] || !process.env["DEFAULT_ADMIN_MAIL"]){
    console.error("Environment variables not set\nServer stopped");
    process.exit();
}

const app = express();
app.use(session({
    secret: secrets.SESSION_SECRET || "è_&é&'dgyubh'njkl,z'(égvhjba'zès(_d-tçfèygpuibonkùl,m",
}))
app.use(api);
app.use(auth);
app.use(express.static(path.join(__dirname, '..', '..', 'dist')));

app.listen(3002, () => console.log("Server started"));