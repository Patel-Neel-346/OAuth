import express from "express";
import {
  AuthSuccess,
  GoogleCallback,
  Login,
  Logout,
  RefreshToken,
  SignUp,
} from "../controller/authController.js";
import {
  Authenticated,
  googleAuth,
  googleAuthCallback,
} from "../middleware/authMiddleware.js";

const AuthRouter = express.Router();

AuthRouter.post("/register", SignUp);
AuthRouter.post("/login", Login);
AuthRouter.post("/logout", Logout);
AuthRouter.get("/refresh-token", Authenticated, RefreshToken);

AuthRouter.get("/google", googleAuth);
AuthRouter.get("/google/callback", googleAuthCallback, GoogleCallback);

AuthRouter.get("/success", AuthSuccess);
export default AuthRouter;
