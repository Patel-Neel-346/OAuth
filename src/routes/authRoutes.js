import express from "express";
import {
  Login,
  Logout,
  RefreshToken,
  SignUp,
} from "../controller/authController.js";
import { Authenticated } from "../middleware/authMiddleware.js";

const AuthRouter = express.Router();

AuthRouter.post("/register", SignUp);
AuthRouter.post("/login", Login);
AuthRouter.post("/logout", Logout);
AuthRouter.get("/refresh-token", Authenticated, RefreshToken);

export default AuthRouter;
