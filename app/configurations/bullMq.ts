import { Queue, Worker } from 'bullmq'
import config from '../configurations/config'
import { sendEmail } from '../utils/email.util'

// Redis connection
let connection: any = {
    // connection: {
    //     password: config.redis.REDIS_PASSWORD,
    //     host: config.redis.REDIS_URL,
    //     port: config.redis.REDIS_PORT
    // }
}

// Queues
// const questionLinkMailQueue = new Queue('questionLinkMailQueue', connection)

// Jobs
const sendMail = (receverMailId: string, subject: string, html: string) => {
    const from = {
        email: process.env.SENDGRID_FROM_EMAIL,
        // name: "testing even"
    }

    sendEmail({ to: receverMailId, from, subject: subject, html: html })
    return 1 //'successfully send mail'
}

export const addJobSendMailQuestionLinkCreation = async (jobData: any, userId: any) => {
    try {

        const set30daySecond = 30 * 24 * 60 * 60 * 1000
        const set60daySecond = 60 * 24 * 60 * 60 * 1000
        const set90daySecond = 90 * 24 * 60 * 60 * 1000

        // await questionLinkMailQueue.add('questionLinkMailJob30', jobData, { removeOnComplete: true, removeOnFail: true, delay: set30daySecond, jobId: userId + "questionLinkMailJob1" })
        // await questionLinkMailQueue.add('questionLinkMailJob60', jobData, { removeOnComplete: true, removeOnFail: true, delay: set60daySecond, jobId: userId + "questionLinkMailJob2" })
        // await questionLinkMailQueue.add('questionLinkMailJob90', jobData, { removeOnComplete: true, removeOnFail: true, delay: set90daySecond, jobId: userId + "questionLinkMailJob3" })
    } catch (error: any) {
        console.log(error.message)
    }
}

// // Workers
// new Worker('questionLinkMailQueue', async (job) => {
//     try {
//         const progressQuestionLink = config.PROGRESS_QUESTION_LINK
//         if (job.id?.includes("questionLinkMailJob1")) {

//             // NOTIFY_USER
//             console.log("Send Reminder 1", "NOTIFY_USER", job.id)

//             // SEND EMAIL
//             let subject = "Complete Your 30-Day Assessment Questionnaire"
//             let html = `Dear ${job.data.userName},</br></br>
//             Congratulations on completing 30 days with us! Your progress is essential to us, and we hope you have been enjoying your time here.
//             Please take a few minutes to complete the assessment by clicking on the link below:${progressQuestionLink}`
//             sendMail(job.data.email, subject, html)
//         }

//         if (job.id?.includes("questionLinkMailJob2")) {

//             // NOTIFY_USER
//             console.log("Send Reminder 2", "NOTIFY_USER")

//             // SEND EMAIL
//             let subject = "Complete Your 60-Day Assessment Questionnaire"
//             let html = `Dear ${job.data.userName},</br></br>
//             Congratulations on completing 60 days with us! Your progress is essential to us, and we hope you have been enjoying your time here.
//             Please take a few minutes to complete the assessment by clicking on the link below:${progressQuestionLink}`
//             sendMail(job.data.email, subject, html)

//         }

//         if (job.id?.includes("questionLinkMailJob3")) {

//             // NOTIFY_USER
//             console.log("Send Reminder 3", "NOTIFY_USER")

//             // SEND EMAIL
//             let subject = "Complete Your 60-Day Assessment Questionnaire"
//             let html = `Dear ${job.data.userName},</br></br>
//              Congratulations on completing 60 days with us! Your progress is essential to us, and we hope you have been enjoying your time here.
//              Please take a few minutes to complete the assessment by clicking on the link below:${progressQuestionLink}`
//             sendMail(job.data.email, subject, html)
//         }

//     } catch (error: any) {
//         console.log(error.message)
//     }

// }, connection)
