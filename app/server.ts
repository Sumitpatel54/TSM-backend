/* eslint-disable semi */
/* eslint-disable no-trailing-spaces */
import http from "http"
import path from "path"

import bodyParser from "body-parser"
// import cookieSession from "cookie-session"
import cors from "cors"
import express, { Request, Response } from "express"
import fileupload from 'express-fileupload'
import session from "express-session"
import mongoose from "mongoose"
import passport from 'passport'
import facebookTokenStrategy from 'passport-facebook-token'
import GoogleStrategy from "passport-google-oauth20"

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
import stripeWebHookRoutes from "./routes/stripeWebHookRoutes.route"
// import userModel from "./models/user.model"
// import exerciseModel from "./models/exercise.model"
// import exerciseListModel from "./models/exerciseList.model"
// import programModel from "./models/program.model"

const NAMESPACE = "Scandinavian Server"
const app = express()


/** Connect to Mongo */
mongoose
    .connect(config.mongo.url /* , config.mongo.options */) // useNewUrlParser, useUnifiedTopology, useFindAndModify, and useCreateIndex are no longer supported options
    .then(() => {
        logging.info(NAMESPACE, "Scandinavian DB Connected")
    })
    .catch((error: any) => {
        logging.error(NAMESPACE, error.message, error)
    })
mongoose.Promise = global.Promise

// // Enable CORS on all origins
app.use(cors())

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


app.use((req, res, next) => {
    if (req.originalUrl === "/stripe-hooks") {
        next()
    } else {
        express.json()(req, res, next)
    }
})

/** Parse the body of the request */
app.use(bodyParser.urlencoded({ extended: true }))

// file upload
app.use(fileupload({
    uploadTimeout: 0
}))

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.COOKIEKEY || ""
}))

app.use(passport.initialize())
app.use(passport.session())

// setting up our serialize and deserialize methods from passport
passport.serializeUser((user: any, done) => {
    // calling done method once we get the user from the db
    done(null, user?.google?.id)
})

passport.deserializeUser((id, done) => {
    User.findOne({ '_id': id })
        .then(currentUser => {
            // calling done once we've found the user
            done(null, currentUser)
        })
})

passport.use('facebookToken', new facebookTokenStrategy({
    clientID: process.env.FACEBOOK_APP_ID || "",
    clientSecret: process.env.FACEBOOK_APP_SECRET || ""
}, async (accessToken, refreshToken, profile, done) => {
    try {

        const existingUser = await User.findOne({ 'facebook.id': profile.id })

        if (existingUser) {
            return done(null, existingUser)
        }

        const newUser = new User({
            method: 'facebook',
            email: profile.emails[0].value,
            facebook: {
                id: profile.id,
                email: profile.emails[0].value,
                token: accessToken
            }
        })

        await newUser.save()
        done(null, newUser)

    } catch (error) {
        done(error, false)
    }
}))

// setting up our Google Strategy when we get the profile info back from Google
passport.use(new GoogleStrategy.Strategy({
    // options for the google strategy
    callbackURL: '/auth/googleRedirect',
    clientID: process.env.GOOGLECLIENTID || "",
    clientSecret: process.env.GOOGLECLIENTSECRET || "",
}, async (accessToken, refreshToken, profile, done) => {
    // passport callback function
    const {
        id: googleId,
        displayName: username,
        _json
    } = profile

    const user = {
        googleId,
        username,
        firstName: _json.given_name,
        lastName: _json.family_name,
        photo: _json.picture,
        email: _json.email,
    }

    const existingUser = await User.findOne({ 'google.id': googleId })

    if (existingUser) {
        return done(null, existingUser)
    }

    const newUser = new User({
        method: 'google',
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        google: {
            id: googleId,
            token: accessToken
        }
    })

    await newUser.save()
    done(null, newUser)
}))

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
app.use('/stats', statsRoutes)
app.use('/user', userRoutes)

// simple route
app.get("/", (_req: Request, res: Response) => {
    res.json({ message: "Welcome to Scandinavian-Backend Application." })
})

// app.use("/wallet", walletRoutes)

//app.use("/stripe-hooks", express.raw({ type: "*/*" }), stripeWebHookRoutes)

const httpServer = http.createServer(app)

httpServer.listen(config.server.port, () => {
    logging.info(NAMESPACE, `Server is running on ${config.server.hostname}:${config.server.port}`)
})

// =====================================
// function getTwoRandomNumber(number: number) {
//     let number1 = Math.abs(Math.floor(Math.random() * number - 1))
//     let number2 = Math.abs(Math.floor(Math.random() * number - 1))

//     if (number1 === number2)
//         getTwoRandomNumber(number)

//     return { number1, number2 }
// }
// function getRandomNumber(number: number) {
//     return Math.abs(Math.floor(Math.random() * number - 1))
// }
// async function getExerciseList(userId: string) {
    
//     try {
//         let exerciseList = []
//         const questionnaireAnswers: any = await userModel.findOne({ _id: userId }, { questionnaireAnswers: 1 })

//         if (questionnaireAnswers === null)
//             return []

//         for (const key in questionnaireAnswers['questionnaireAnswers']) {
//             const exercise = questionnaireAnswers['questionnaireAnswers'][key]['questionnaire']['queryBlock'].filter((i: any) => {
//                 if (i?.isExercise)
//                     return i
//             })
//             exerciseList.push(exercise)
//         }

//         return exerciseList.flat(1)

//     } catch (error: any) {
//         console.log(error.message)
//     }
// }


// function exerciseSeederInTemplate(templates: any[], exercises: any[]) {
//     console.log("calling the exerciseSeederInTemplate =======")
//     const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
//     if (exercises.length === 0) {
//         return
//     }

//     if (exercises.length === 1) {
//         for (const i of templates) {
//             for (const j in i['days']) {
//                 if (days.includes(j)) {
//                     i['days'][j].push(exercises[0])
//                 }
//             }
//         }

//     } else {
//         for (const i of templates) {
//             for (const j in i['days']) {
//                 if (days.includes(j)) {
//                     const randomNumbers = getTwoRandomNumber(exercises.length)
//                     i['days'][j].push(exercises[randomNumbers.number1])
//                     i['days'][j].push(exercises[randomNumbers.number2])
//                 }
//             }
//         }
//     }
// }

// async function fphOrRsExerciseGetAndSeed(exerciseList: any[], templates: any[], { fhpID, rsID }: { fhpID: string, rsID: string }) {
//     try {
//         console.log("fphOrRsExerciseGetAndSeed ==", fphOrRsExerciseGetAndSeed)
//         const isExerciseFound = {
//             fhp: false,
//             rs: false
//         }

//         for (const i of exerciseList) {
//             if (i.exerciseTag === "Forward head posture") {
//                 isExerciseFound['fhp'] = true

//             } else if (i.exerciseTag === "Rounded shoulders") {
//                 isExerciseFound['rs'] = true

//             }
//         }
//         console.log(isExerciseFound)

//         if (!isExerciseFound.fhp && !isExerciseFound.rs)
//             return

//         if (isExerciseFound.fhp) {
//             const fhpExercises = await exerciseListModel.find({ tagId: fhpID })
//             exerciseSeederInTemplate(templates, fhpExercises)
//         }

//         if (isExerciseFound.rs) {
//             const rsExercises = await exerciseListModel.find({ tagId: rsID })
//             exerciseSeederInTemplate(templates, rsExercises)
//         }

//         return

//     } catch (error: any) {
//         console.log(error.message)
//     }
// }

// async function programGeneration(userId: string) {
//     try {
//         console.log("programGeneration ============");
        
//         const exerciseList: any = await getExerciseList(userId)
        
//         console.log("programGeneration ============", exerciseList);
//         if (exerciseList.length === 0)
//             return "No exercise found"

//         let templates: any = []
//         const program: any = await programModel.findOne({ userId: userId }, { templates: 1 })
//         templates = program['templates']
//         const tags: any = await exerciseModel.findOne({ title: "Postural" }, { tags: 1, _id: 0 })
//         const fhpID = tags.tags.find((i: any) => i.title === "Forward head posture")._id.valueOf()
//         const rsID = tags.tags.find((i: any) => i.title === "Rounded shoulders")._id.valueOf()

//         await fphOrRsExerciseGetAndSeed(exerciseList, templates, { fhpID, rsID })

//         let otherExercises = []
//         const exercisesListWithOutFHPAndRs = await exerciseListModel.find({ tagId: { $nin: [fhpID, rsID] }, exerciseParentName: "Postural" })

//         for (const exercise of exerciseList) {
//             if (exercise.exerciseTag !== "Forward head posture" && exercise.exerciseTag !== "Rounded shoulders") {
//                 if (exercise?.exercise === "Postural") {
//                     if (exercise.exerciseType === "Random") {
//                         otherExercises.push(exercisesListWithOutFHPAndRs[getRandomNumber(exercisesListWithOutFHPAndRs.length)])
//                     } else {
//                         const manualSelectedExercise = await exerciseListModel.findOne({ _id: exercise.exerciseList[0] })
//                         if (manualSelectedExercise !== null) {
//                             otherExercises.push(manualSelectedExercise)
//                         }
//                     }
//                 }
//             }
//         }

//         exerciseSeederInTemplate(templates, otherExercises)

//         await programModel.updateOne({ userId: userId }, { $set: { templates: templates } })
//         return "Program is created"

//     }
//     catch (error: any) {
//         console.log(error.message)
//     }
// }

// programGeneration("65e8353de8899ad21c423422")
//     .then(res => console.log("res ==", res))
//     .catch(err => console.log('eerr ==', err))

