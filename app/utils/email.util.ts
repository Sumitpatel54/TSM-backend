import config from "../configurations/config"
import * as nodemailer from "nodemailer"

// Sett opp Nodemailer (vår nye SMTP-klient)
const transporter = nodemailer.createTransport({
  host: config.smtp.HOST,
  port: Number(config.smtp.PORT),
  secure: false, // true for port 465, false for andre porter (som 587)
  auth: {
    user: config.smtp.USER,
    pass: config.smtp.PASS,
  },
})

/**
 * En generell funksjon for å sende e-post med Nodemailer (via SES SMTP)
 * @param obj - Et objekt som inneholder to, from, subject, og html
 */
export const sendEmail = async (obj: any) => {
  const mailOptions = {
    from: obj.from, // Avsender-epost (f.eks. espen@curemigraine.org)
    to: obj.to, // Mottaker-epost
    subject: obj.subject, // Emne
    html: obj.html, // Innhold
  }

  try {
    // Sjekk om vi er i "production"-miljø.
    if (process.env.NODE_ENV !== 'production') {
      console.log("IKKE-PRODUKSJON: E-post ville blitt sendt til:", obj.to)
      console.log("Emne:", obj.subject)
      // console.log("Innhold:", obj.html);
      return { messageId: 'fake-message-id-local' } // Returner en falsk MessageId
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("E-post sendt via SES (Nodemailer):", info.messageId)
    return info
  } catch (error) {
    console.error("Feil ved sending av e-post med Nodemailer:", error)
    throw error
  }
}

/**
 * @summary - When user abruptly leaves the questionnaire
 * @param user
 * @param _req
 */
export const sendEmailIfUserAbruptlyLeavesQuestionnaire = async (user: any, _req: any) => {
  let subject = 'Questinnaire not completed'
  let to = user.email
  let from = config.smtp.FROM_EMAIL // Bruker SMTP "fra"-epost
  let html = `
    <p>Hi ${user.firstName},<p><br><p>This is a reminder thet a questionnaire is waiting for you to complete.</p>`

  await sendEmail({ to, from, subject, html })
}

/**
 * @summary - When user does not continue to questionnaire
 * @param user
 * @param _req
 */
export const sendEmailIfUserDoesNotContinueToQuestionnaire = async (user: any, _req: any) => {
  let subject = 'Questinnaire Reminder'
  let to = user.email
  let from = config.smtp.FROM_EMAIL // Bruker SMTP "fra"-epost
  let html = `
    <p>Hi ${user.firstName},<p><br><p>This is a reminder thet a questionnaire is waiting for you to complete.</p>`

  await sendEmail({ to, from, subject, html })
}

/**
 * @summary - Email trigger for when user makes payment but has not signed up
 * @param user
 * @param _req
 */
export const sendEmailIfUserNotSignupButMakesPayment = async (user: any, _req: any) => {
  let subject = 'SignUp Reminder'
  let to = user.email
  let from = config.smtp.FROM_EMAIL // Bruker SMTP "fra"-epost
  let html = `
    <p>Hi ${user.firstName},<p><br><p>This is a reminder to sign up to enjoy more of our product features.</p>`

  await sendEmail({ to, from, subject, html })
}

export const sendEmailVerification = async (user: any, req: any) => {
  const token = user.generateVerificationToken()

  //save the verification token
  await token.save()

  let subject = 'Confirm Your Email to Begin Your Journey'
  let to = user.email
  let from = config.smtp.FROM_EMAIL // Bruker SMTP "fra"-epost

  // **** DENNE LINJEN ER KORRIGERT (Feil #2) ****
  let link = `${config.LOCAL_SERVER.host_url}/email/verification?token=${token.token}`

  let html = `
    <p>Hi ${user.firstName},
    <p>Welcome to The Scandinavian Method! We’re excited to help you take the first step toward a migraine-free life.</p>
    <p>Before we can start, we need to make sure we have the correct email address. Please confirm your email by clicking the link below:</p>
    <p> <a href="${link}">${link} </a>.</p>
    <p>By confirming your email, you’ll gain access to personalized resources, expert advice, and support that are essential for reducing the frequency and intensity of your migraines.</p>
    <p>This small step is crucial in ensuring you receive all the tools and information you need. Thank you for taking the time to do this—we’re here to support you every step of the way.</p>
    <p><b>Disclaimer: </b>Please note that our program offers general wellness advice and is not a substitute for professional medical care. We are not licensed healthcare providers outside Norway. Always consult with your healthcare provider before making any changes to your health regimen.</p>
    <p>
    Best regards, <br>
    The Scandinavian Method Team
    </p>
    `

  await sendEmail({ to, from, subject, html })
}

export const sendEmailResetPassword = async (user: any, req: any) => {
  const token = user.generateVerificationToken()

  //save the verification token
  await token.save()

  let subject = 'Accout Verification'
  let to = user.email
  let from = config.smtp.FROM_EMAIL // Bruker SMTP "fra"-epost
  let link = 'https://' + req.headers.host + '/email/verification?token=' + token.token
  let html = `
  <p>Hi ${user.firstName},<p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p>`

  await sendEmail({ to, from, subject, html })
}

/**
 * @summary - Email trigger for when user finishes questionnaire
 * @param user
 *_req
 */
export const sendEmailWhenUserFinishesQuestionnaire = async (user: any, _req: any) => {
  let subject = 'Your next step!'
  let to = user.email
  let from = config.smtp.FROM_EMAIL // Bruker SMTP "fra"-epost
  let html = `
    <p>Hi ${user.firstName}>`

  await sendEmail({ to, from, subject, html })
}

/**
 * @summary - When user resets password
 * @param user
 *_req
 */
export const sendEmailWhenUserResetsPassword = async (user: any, _req: any) => {
  let subject = `Reset your password.`
  let to = user.email
  let from = config.smtp.FROM_EMAIL // Bruker SMTP "fra"-epost
  let html = `
    <p>Hi ${user.firstName}></p>
    <p>Here is`

  await sendEmail({ to, from, subject, html })
}

/**
 * @summary - When user signs up
 * @param user
 *_req
 */
export const sendEmailWhenUserSignsUp = async (user: any, _req: any) => {
  let subject = `Welcome to The Scandinavian Method!`
  let to = user.email
  let from = config.smtp.FROM_EMAIL // Bruker SMTP "fra"-epost
  let html = `
    <p>Hi ${user.firstName},</p>
    
    <p>Welcome to The Scandinavian Method! We're thrilled to have you join our community dedicated to reducing the intensity and frequency of migraines and tension-type headaches.</p>
    <h2>Here's what to do next:</h2>
    <ol>
            <li>
                <strong>Log in to Your Account:</strong> 
                <a href="${config.API_URL}/login">Login Link</a>
            </li>
            <li>
                <strong>Explore Your Dashboard:</strong> 
                Familiarize yourself with the resources, tools, and support available to you.
            </li>
            <li>
                <strong>Start Your First Module:</strong> 
                Dive into the program and begin your journey toward a migraine-free life.
            </li>
    </ol>
    
    <p>Remember, it's important to adapt the program to fit your individual needs and medical conditions. Ensure that any dietary recommendations align with your allergies and dietary restrictions, and always exercise within your physical limits to avoid injury. If you're unsure about any part of the program, consult with your healthcare provider to tailor it to your specific health requirements.

    We’re here to support you every step of the way. If you have any questions or need assistance, don’t hesitate to reach out.
    
    
    <b>Disclaimer: </b> Please note that our program offers general wellness advice and is not a substitute for professional medical care. We are not licensed healthcare providers outside Norway. Always consult with your healthcare provider before making any changes to your health regimen.
    
    </p>

    <p>
    Best regards, <br>
    The Scandinavian Method Team

    </p>


    
    `

  await sendEmail({ to, from, subject, html })
}

export const sendTemplate = async (email: string, subject: string, templateId: string, dynamicTemplateData: object) => {
  try {
    // Denne logikken var SendGrid-spesifikk (templateId).
    // Den må bygges om hvis den skal brukes med SES.
    // For nå sender vi en enkel e-post som viser at den må fikses.
    const html = `
      <h3>Debug: Funksjonen 'sendTemplate' ble kalt</h3>
      <p>Denne funksjonen må bygges om til å bruke SES-maler i stedet for SendGrid-maler.</p>
      <p><b>Template ID:</b> ${templateId}</p>
      <p><b>Data:</b> ${JSON.stringify(dynamicTemplateData)}</p>
    `

    await sendEmail({
      from: config.smtp.FROM_EMAIL,
      to: email,
      subject: `[DEBUG] ${subject}`,
      html: html
    })

  } catch (error: any) {
    console.error("Feil i 'sendTemplate':", error.message)
    throw new Error(error.message)
  }
}
