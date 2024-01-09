import {remultExpress} from 'remult/remult-express';
import {createKnexDataProvider} from "remult/remult-knex";

import {Reservation} from '../shared/Reservation';
import {Machine} from "../shared/Machine";
import {User} from "../shared/User";
import {Log} from "../shared/Log";
import {ReservationController} from '../shared/ReservationController';
import {MachineController} from "../shared/MachineController";
import {UserController} from "../shared/UserController";
import initDatabase from "./initDatabase";


declare module 'remult' {
    export interface UserInfo {
        mail: string,
        isAdmin?: boolean
    }
}

export const api = remultExpress({
    // The entities stored in the database
    entities: [Reservation, Machine, User, Log],

    // The controllers that implement custom API endpoints
    controllers: [ReservationController, MachineController, UserController],

    // The database connection provider
    dataProvider: createKnexDataProvider({
        // Knex client configuration for SQLite
        client: "sqlite3",
        connection: {
            filename: "./db/db.sqlite"
        },
        useNullAsDefault: true
    }),

    // The function that returns the user token for a server request
    getUser: req => req.session!["user"],

    // The function that initializes the database
    // Called every time the server starts
    initApi: initDatabase
});