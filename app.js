import express from 'express'
import session, { MemoryStore } from 'express-session'
import passport from 'passport'
import { initializePassport } from './configs/passport.js'
import usersRoutes from './routes/users-routes.js'
import cors from 'cors'
import helmet from 'helmet'

const app = express()

app.use(helmet())
app.use(express.json())
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5500']
}))
app.use(session({
    secret: 'secret session cookie',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore(),
    cookie: {
        maxAge: 1000 * 3600 * 24 * 4,
        sameSite: 'strict',
        path: '/', httpOnly: true, signed: true
    }
}))
app.use(passport.initialize())
app.use(passport.session())
initializePassport(passport)

app.use('/api/users', usersRoutes)

app.get('/', (req,res) => {
    res.send('hello world')
})

export default app