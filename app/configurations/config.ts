import path from "path"

import * as dotenv from "dotenv"
dotenv.config({ path: path.join(__dirname, "../../.env") })

const MONGO_OPTIONS = {
  useNewUrlParser: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}

const MONGO_USERNAME = process.env.MONGO_USERNAME || ''
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || ''
const MONGO_HOST = process.env.MONGO_URL || ''
const PROGRESS_QUESTION_LINK = process.env.PROGRESS_QUESTION_LINK || ''

const MONGO = {
  host: MONGO_HOST,
  username: MONGO_USERNAME,
  password: MONGO_PASSWORD,
  options: MONGO_OPTIONS,
  url:
    MONGO_USERNAME !== "" && MONGO_PASSWORD !== ""
      ? `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}`
      : `${MONGO_HOST}`
}

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || "localhost"
const SERVER_PORT = process.env.SERVER_PORT || 3000

const SERVER = {
  hostname: SERVER_HOSTNAME,
  port: SERVER_PORT
}
const LOCAL_SERVER = {
  // host_url: 'http://localhost:3000',
  host_url: 'https://client.curemigraine.org',
}

const API_URL = 'https://api.curemigraine.org'
// const API_URL = 'http://localhost:8000'

const JWT = {
  accessTokenPrivateKey: process.env.ACCESS_TOKEN_SECRET || "secret",
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_LIFE,
  refreshTokenPrivateKey: process.env.REFRESH_TOKEN_SECRET || "secret",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_LIFE
}

// const SMTP_CONFIGURATION = {
//   SMTP_HOST: process.env.SMTP_HOST || "",
//   SMTP_PORT: process.env.SMTP_PORT || "2525",
//   SMTP_USERNAME: process.env.SMTP_USERNAME || "",
//   SMTP_PASSWORD: process.env.SMTP_PASSWORD || "",
//   EMAIL_FROM: process.env.MAIL_FROM || ""
// }

const GOOGLE_OAUTH_CREDENTIALS = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  AUTH_REDIRECT_URL: process.env.GOOGLE_OAUTH_REDIRECT_URL
}

// const aws_parameters = {
//   accessKeyId: process.env.ACCESS_KEY_ID,
//   secretAccessKey: process.env.SECRET_ACCESS_KEY,
//   bucket: process.env.BUCKET,
//   root_folder: process.env.BUCKET_APP_ROOT_FOLDER || ""
// }

const sendGrid = {
  API_KEY: process.env.SENDGRID_API_KEY || "",
  FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || "",
  VERIFY_ADMIN_TEMPLATE: process.env.SENDGRID_VERIFY_ADMIN_TEMPLATE || ""
}

// const sendSendbird = {
//   APPLICATION_ID: process.env.SENDBIRD_APPLICATION_ID || "",
//   API_TOKEN: process.env.SENDBIRD_API_TOKEN || ""
// }
// const ellingsenxMongoUrl = process.env.ELLINGSEN_MONGO_URL || ""

// const TOKEN_ISSUER = process.env.TOKEN_ISSUER || ""

const routePermission = {
  onlyAdmin: ["admin"],
  onlyUser: ["user"]
}

const STRIPE = {
  API_SECRET: `${process.env.STRIPE_API_SECRET}` || "",
  API_ENV: `${process.env.STRIPE_API_ENVIRONMENT}` || "",
  API_VERSION: `${process.env.STRIPE_API_VERSION}` || "",
  WEBHOOK_ENDPOINT_SECRET: process.env.WEBHOOK_ENDPOINT_SECRET || ""
}
const redis = {
  REDIS_PASSWORD: `${process.env.REDIS_PASSWORD}` || "",
  REDIS_URL: `${process.env.REDIS_URL}` || "",
  REDIS_PORT: `${process.env.REDIS_PORT}` || "",
}
const config = {
  server: SERVER,
  mongo: MONGO,
  sendGrid,
  jwt: JWT,
  SERVER_HOSTNAME,
  routePermission,
  stripe: STRIPE,
  redis,
  PROGRESS_QUESTION_LINK,
  LOCAL_SERVER,
  GOOGLE_OAUTH_CREDENTIALS,
  API_URL
}

export default config
