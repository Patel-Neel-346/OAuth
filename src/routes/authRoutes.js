import express from "express";
import { Login, Logout, SignUp } from "../controller/authController.js";

const AuthRouter = express.Router();

AuthRouter.post("/register", SignUp);
AuthRouter.post("/login", Login);
AuthRouter.post("/logout", Logout);

export default AuthRouter;
