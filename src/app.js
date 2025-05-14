import express from "express";
import connectDb from "./config/DbConnect.js";
import { ConfigENV } from "./config/index.js";
import cookieParser from "cookie-parser";
import AuthRouter from "./routes/authRoutes.js";
import passport from "passport";
import session from "express-session"; // Import session from express-session instead
import "./config/passport.js"; // Import passport configuration
import swaggerDocs from "./config/swagger.js"; // Import swagger config

const PORT = ConfigENV.PORT;

const app = express();

connectDb();
app.get("/", (req, res) => {
  res.send("Hello World! :)");
});

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: ConfigENV.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", AuthRouter);
app.use("/api/v1/user", AuthRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Server is Running on http://localhost:${PORT}`);
  swaggerDocs(app); // Initialize Swagger docs
});
