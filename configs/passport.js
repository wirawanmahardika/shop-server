import bcrypt from 'bcrypt'
import { Strategy } from "passport-local";
import { prisma } from '../src/prisma-client.js'
import { error } from "../utils/response.js";

export function initializePassport(passport) {
    passport.use(new Strategy({usernameField: 'username'}, async (username, password, done) => {
        const user = await prisma.users.findFirst({where: {username}})

        if(!user) { return done({...error(401, 'Username tidak terdaftar')}, false)}

        if(!(await bcrypt.compare(password, user.password))) {
            return done({...error(401, 'Password invalid')}, false)
        }

        return done(null, user)
    }))

    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser(async(id, done) => {
        const user = await prisma.users.findUnique({
            where: {id: id}
        })

        if(!user) {
            return done({...error(401, 'Riwayat login anda tidak tersedia')}, false)
        }

        delete user.password
        return done(null, user)
    })
}

export function isAuthencticated(req,res,next) {
    if(req.isAuthenticated()) {
        return next()
    }
    return res.status(401).json({...error(401, 'Anda harus login terlebih dahulu')})
}

export function ensureAuthenticated(req,res,next) {
    if(req.isAuthenticated()) {
        return res.status(403).json({...error(403, 'Anda sudah pernah login')})
    }
    return next()
}