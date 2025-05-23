import dotenv from "dotenv";
dotenv.config();

const {
  PORT,
  MONGO_URI,
  DB_NAME,
  JWT_SECRET_ACCESS_TOKEN,
  JWT_EXPIRES_IN,
  JWT_EXPIRES_REFRESH_EXPIRES_IN,
  JWT_EXPIRES_REFRESH_SECRET,
  SESSION_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  FACEBOOK_CALLBACK,
} = process.env;

export const ConfigENV = {
  PORT,
  MONGO_URI,
  DB_NAME,
  JWT_SECRET_ACCESS_TOKEN,
  JWT_EXPIRES_IN,
  JWT_EXPIRES_REFRESH_EXPIRES_IN,
  JWT_EXPIRES_REFRESH_SECRET,
  SESSION_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  FACEBOOK_CALLBACK,
};
