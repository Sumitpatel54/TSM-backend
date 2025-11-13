/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable semi */
/* eslint-disable no-trailing-spaces */
import http from "http"
import path from "path"

import bodyParser from "body-parser"
import dotenv from 'dotenv';
// import cookieSession from "cookie-session"
import cors from "cors"
import express, { Request, Response } from "express"
import fileupload from 'express-fileupload'
import session from "express-session"
import mongoose from "mongoose"
import passport from 'passport'
// import facebookTokenStrategy from 'passport-facebook-token'
// import GoogleStrategy from "passport-google-oauth20"

import config from "./configurations/config"
import logging from "./configurations/logging"
// import SupportedOriginModel from "./models/supportedOrigin.model"
import User from './models/user.model'
import adminRoutes from "./routes/admin.route"
import authRoutes from "./routes/auth.route"
import categoryRoutes from "./routes/category.route"
import exerciseRoutes from "./routes/exercise.route"
import microCategoryRoutes from "./routes/micro-category.route"
import nutritionExampleRoutes from "./routes/nutrition-example.routes"
import nutritionInformationRoutes from "./routes/nutrition-information.routes"
import exerciseInformationRoutes from "./routes/exercise-information.routes"
import programRoutes from "./routes/program.route"
import questionnaireRoutes from "./routes/questionnaire.route"
import statsRoutes from "./routes/stats.route"
import stressManagementRoutes from "./routes/stress-management.route"
import stripeRoutes from "./routes/stripe.route"
import subCategoryRoutes from "./routes/sub-category.route"
import testRoutes from "./routes/test.route"
import userRoutes from "./routes/user.route"
import dailyTipRoutes from "./routes/daily-tip.routes";
import stripeWebHookRoutes from "./routes/stripeWebHookRoutes.route"
import authBypassRoutes from "./routes/auth-bypass.route"

// Suppress AWS SDK v2 maintenance warning
process.env.AWS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = 'true';

dotenv.config( );
const NAMESPACE = "Scandinavian Server"
const app = express()

// Add this line before MongoDB connection
mongoose.set('strictQuery', true); // Or true, depending on your needs

/** Connect to Mongo */
mongoose
    .connect(config.mongo.url, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    })
    .then(() => {
        logging.info(NAMESPACE, "Scandinavian DB Connected")
    })
    .catch((error: any) => {
        logging.error(NAMESPACE, "MongoDB Connection Error:", error)
        // Optionally exit the process on connection failure
        process.exit(1)
    })

// Add error handlers for the connection
mongoose.connection.on('error', (error: any) => {
    logging.error(NAMESPACE, "MongoDB Connection Error:", error)
})

mongoose.connection.on('disconnected', () => {
    logging.warn(NAMESPACE, "MongoDB Disconnected. Attempting to reconnect...")
})

mongoose.connection.on('reconnected', () => {
    logging.info(NAMESPACE, "MongoDB Reconnected")
})

mongoose.Promise = global.Promise

app.use(cors({
    origin: ['http://localhost:3000', 'https://tsm-prod.vercel.app', 'https://api.curemigraine.org', 'https://tsm-web.vercel.app', 'http://localhost:8000', 'https://tsm-web-git-admin-dashboard-the-scandinavian-method.vercel.app', 'https://tsm-prod-git-main-the-scandinavian-method.vercel.app', 'https://client.curemigraine.org'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', '*'],
    credentials: true,
} ));

app.use(express.static(path.join(__dirname, 'public')))

/** Log the request */
app.use((req, res, next) => {
    /** Log the req */
    logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`)

    res.on("finish", () => {
        /** Log the res */
        logging.info(
            NAMESPACE,
            `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`
        )
    })

    next()
})

/** Parse the body of the request */
app.use(bodyParser.urlencoded({ extended: true }))

// file upload
app.use(fileupload({
    uploadTimeout: 0,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    useTempFiles: true,
    tempFileDir: '/tmp/',
    abortOnLimit: true
}));

// Also increase the body parser limit
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(session({
    resave: false,
    saveUninitialized: true,
    // FIX: Cast the secret to the expected type to resolve TS2345 error
    secret: (process.env.COOKIEKEY || "") as string | string[]
}))

app.use(passport.initialize())
app.use(passport.session())


// passport.use('facebookToken', new facebookTokenStrategy({
//     clientID: process.env.FACEBOOK_APP_ID || "",
//     clientSecret: process.env.FACEBOOK_APP_SECRET || ""
// }, async (accessToken, refreshToken, profile, done) => {
//     try {

//         const existingUser = await User.findOne({ 'facebook.id': profile.id })

//         if (existingUser) {
//             return done(null, existingUser)
//         }

//         const newUser = new User({
//             method: 'facebook',
//             email: profile.emails[0].value,
//             facebook: {
//                 id: profile.id,
//                 email: profile.emails[0].value,
//                 token: accessToken
//             }
//         })

//         await newUser.save()
//         done(null, newUser)

//     } catch (error) {
//         done(error, false)
//     }
// }))

// setting up our Google Strategy when we get the profile info back from Google

// interface GoogleUser {
//     id: string;
//     token: string;
// }

// passport.use(new GoogleStrategy.Strategy({
//     // options for the google strategy
//     callbackURL: `${config.API_URL}/auth/callback/google`,
//     // callbackURL: `http://localhost:8000/auth/callback/google`,
//     clientID: config.GOOGLE_OAUTH_CREDENTIALS.CLIENT_ID!,
//     clientSecret: config.GOOGLE_OAUTH_CREDENTIALS.CLIENT_SECRET!,
// }, async (accessToken, refreshToken, profile, done ) => {
//     try {
//         const { id: googleId, _json } = profile

//         let user = await User.findOne({ 'google.id': googleId })

//         if (user) {
//             // Update the access token
//             (user.google as GoogleUser).token = accessToken;
//             await user.save()
//         } else {
//             // Create a new user
//             user = new User({
//                 method: 'google',
//                 email: _json.email,
//                 firstName: _json.given_name,
//                 lastName: _json.family_name,
//                 google: {
//                     id: googleId,
//                     token: accessToken
//                 },
//                 isVerified: true,
//                 isActive: true
//             })
//             await user.save()
//         }

//         // Login successful, write toke, and send back user
//         let token = user.generateJWT()

//         return done(null, user)
//     } catch (error) {
//         return done(error, false)
//     }
// }))

/** Routes go here */
app.use("/auth", authRoutes)
app.use("/admin", adminRoutes)
app.use("/test", testRoutes)
app.use("/category", categoryRoutes)
app.use("/subCategory", subCategoryRoutes)
app.use("/nutritionInformation", nutritionInformationRoutes)
app.use("/exerciseInformation", exerciseInformationRoutes)
app.use('/nutritionExample', nutritionExampleRoutes)
app.use("/microCategory", microCategoryRoutes)
app.use("/questionnaire", questionnaireRoutes)
app.use("/exercise", exerciseRoutes)
app.use("/stressManagement", stressManagementRoutes)
app.use("/program", programRoutes)
app.use("/financial", stripeRoutes)
app.use("/stripe-hooks", express.raw({ type: "*/*" }), stripeWebHookRoutes)
app.use("/api/public", authBypassRoutes) // New route that completely bypasses authentication
app.use('/stats', statsRoutes)
app.use('/user', userRoutes)
app.use("/dailyTips", dailyTipRoutes)

// simple route
app.get("/", (_req: Request, res: Response) => {
    res.json({ message: "Welcome to Scandinavian-Backend Application." })
})

// app.use("/wallet", walletRoutes)

//app.use("/stripe-hooks", express.raw({ type: "*/*" }), stripeWebHookRoutes)

const httpServer = http.createServer(app )
const PORT = process.env.PORT || 8000;


// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error("Global error handler caught:", err);
    res.status(err.status || 500).json({
        status: false,
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

httpServer.listen(PORT, ( ) => {
    logging.info(NAMESPACE, `Server is running on ${config.server.hostname}:${config.server.port}`)
})

export default app
