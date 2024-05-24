import config from "../configurations/config"

const sendGridMail = require("@sendgrid/mail")
sendGridMail.setApiKey(config.sendGrid.API_KEY)


export const sendEmail = async (obj:any) => {
  await sendGridMail.send(obj)
}

/**
 * @summary - When user abruptly leaves the questionnaire
 * @param user
 * @param _req
 */
export const sendEmailIfUserAbruptlyLeavesQuestionnaire = async (user: any, _req: any) => {
    let subject = 'Questinnaire not completed'
    let to = user.email
    let from = `${config.sendGrid.FROM_EMAIL}`
    let html = `
    <p>Hi ${user.firstName},<p><br><p>This is a reminder thet a questionnaire is waiting for you to complete.</p>`

    await sendGridMail.send({ to, from, subject, html })
}

/**
 * @summary - When user does not continue to questionnaire
 * @param user
 * @param _req
 */
export const sendEmailIfUserDoesNotContinueToQuestionnaire = async (user: any, _req: any) => {
    let subject = 'Questinnaire Reminder'
    let to = user.email
    let from = `${config.sendGrid.FROM_EMAIL}`
    let html = `
    <p>Hi ${user.firstName},<p><br><p>This is a reminder thet a questionnaire is waiting for you to complete.</p>`

    await sendGridMail.send({ to, from, subject, html })
}

/**
 * @summary - Email trigger for when user makes payment but has not signed up
 * @param user
 * @param _req
 */
export const sendEmailIfUserNotSignupButMakesPayment = async (user: any, _req: any) => {
    let subject = 'SignUp Reminder'
    let to = user.email
    let from = `${config.sendGrid.FROM_EMAIL}`
    let html = `
    <p>Hi ${user.firstName},<p><br><p>This is a reminder to sign up to enjoy more of our product features.</p>`

    await sendGridMail.send({ to, from, subject, html })
}

export const sendEmailVerification = async (user: any, req: any) => {
    const token = user.generateVerificationToken()

    //save the verification token
    await token.save()

    let subject = 'Accout Verification'
    let to = user.email
    let from = `${config.sendGrid.FROM_EMAIL}`
    let link = 'https://' + req.headers.host + '/auth/verify/' + token.token
    let html = `
    <p>Hi ${user.firstName},<p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p>`

    await sendGridMail.send({ to, from, subject, html })
}

export const sendEmailResetPassword = async (user: any, req: any) => {
  const token = user.generateVerificationToken()

  //save the verification token
  await token.save()

  let subject = 'Accout Verification'
  let to = user.email
  let from = `${config.sendGrid.FROM_EMAIL}`
  let link = 'https://' + req.headers.host + '/auth/verify/' + token.token
  let html = `
  <p>Hi ${user.firstName},<p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p>`

  await sendGridMail.send({ to, from, subject, html })
}

/**
 * @summary - Email trigger for when user finishes questionnaire
 * @param user
 * @param _req
 */
export const sendEmailWhenUserFinishesQuestionnaire = async (user: any, _req: any) => {
    let subject = 'Your next step!'
    let to = user.email
    let from = `${config.sendGrid.FROM_EMAIL}`
    let html = `
    <p>Hi ${user.firstName}>`

    await sendGridMail.send({ to, from, subject, html })
}

/**
 * @summary - When user resets password
 * @param user
 * @param _req
 */
export const sendEmailWhenUserResetsPassword = async (user: any, _req: any) => {
    let subject = `Reset your password.`
    let to = user.email
    let from = `${config.sendGrid.FROM_EMAIL}`
    let html = `
    <p>Hi ${user.firstName}></p>
    <p>Here is`

    await sendGridMail.send({ to, from, subject, html })
}

/**
 * @summary - When user signs up
 * @param user
 * @param _req
 */
export const sendEmailWhenUserSignsUp = async (user: any, _req: any) => {
    let subject = `Welcome ${user.firstName}`
    let to = user.email
    let from = `${config.sendGrid.FROM_EMAIL}`
    let html = `
    <p>Hi ${user.firstName}>`

    await sendGridMail.send({ to, from, subject, html })
}

export const sendTemplate = async (email: string, subject: string, templateId: string, dynamicTemplateData: object) => {
    try {
        const message = () => {
            return {
                from: {
                  email: process.env.SENDGRID_FROM_EMAIL,
                  name: "Cure Migraine"
                },
                to: `${email}`,
                subject: subject,
                templateId,
                dynamic_template_data: dynamicTemplateData
            }
        }
        return await sendGridMail.send(message())
    } catch (error: any) {
        throw new Error(error.message)
    }
}
