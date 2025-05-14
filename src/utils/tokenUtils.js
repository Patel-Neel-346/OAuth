import jwt from "jsonwebtoken";
import { ConfigENV } from "../config/index.js";

//generate AuthToken
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    ConfigENV.JWT_EXPIRES_REFRESH_SECRET,
    {
      expiresIn: ConfigENV.JWT_EXPIRES_REFRESH_EXPIRES_IN,
    }
  );
};

export const generateAuthToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    ConfigENV.JWT_SECRET_ACCESS_TOKEN,
    {
      expiresIn: ConfigENV.JWT_EXPIRES_IN,
    }
  );
};

//verify Tokens

export const VerifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, ConfigENV.JWT_EXPIRES_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

export const VerifyAuthToken = (token) => {
  try {
    return jwt.verify(token, ConfigENV.JWT_SECRET_ACCESS_TOKEN);
  } catch (error) {
    return null;
  }
};
