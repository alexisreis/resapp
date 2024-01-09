import {remult, UserInfo} from "remult";
import express, { Router } from "express"

import {User} from "../shared/User";
import {api} from "./api";


export const auth = Router()

auth.use(express.json())


/**
 * Get a user from DB
 * @param username user flastname
 */
const getUserFromDb = async (username: string) => {
    const userRepo = remult.repo(User);
    return await userRepo.findFirst({account: username});
}

/**
 * Create a user in DB
 * @param account user flastname
 * @param name user name
 * @param mail user mail
 */
const createUserInDb = async (account: string, name: string, mail: string) => {
    const userRepo = remult.repo(User);
    return await userRepo.save({account: account, name: name, mail: mail})
}

/**
 * Sign in a user with request body params
 * In PROD : authenticate with LDAP and create user in DB if it doesn't exist
 * In DEV : doesn't use LDAP (password is ignored) and use admin | admin or user | user
 * @param username
 * @param password
 */
auth.post("/api/signIn", api.withRemult,  async (req, res) => {
    const account = req.body.username;
    const password = req.body.password;

    // Check if params are set
    if (!account || !password || typeof account !== "string" || typeof password !== "string")
        return res.status(400).json({error: "Username and password are required"})


    let dbUser: User | null = null;

    // TODO : PROD MODE
    // DEV MODE --- admin or user (password is ignored)
    dbUser = await getUserFromDb(req.body.username)
    if (!dbUser) {
        return res.status(403).json({error: "Authentication failure, please check your credentials"});
    }

    // User is authenticated and exists in DB, set session and return user
    const userInfo:UserInfo = {...dbUser, roles: (dbUser?.isAdmin? ["admin"] : [])}
    req.session!["user"] = userInfo
    res.json(dbUser)
})


/**
 * Sign out a user
 */
auth.post("/api/signOut", (req, res) => {
    req.session!["user"] = null
    res.json({"status": "Successfully signed out"});
})


/**
 * Return the token of current user (if the user is already authenticated)
 */
auth.get("/api/currentUser", (req, res) => res.json(req.session!["user"]))
