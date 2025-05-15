import express from "express";
import connectDb from "./config/DbConnect.js";
import { ConfigENV } from "./config/index.js";
import cookieParser from "cookie-parser";
import AuthRouter from "./routes/authRoutes.js";
import passport from "passport";
import session from "express-session";
import cors from "cors"; // Add CORS package (you'll need to install this)
import "./config/passport.js";
import swaggerDocs from "./config/swagger.js";

const PORT = ConfigENV.PORT || 7000;
const app = express();

// Connect to database
connectDb();

// Enable CORS with credentials support
app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"], // Allow both versions of localhost
    credentials: true, // Allow cookies to be sent with requests
  })
);

// Parse JSON and URL-encoded bodies
app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: ConfigENV.SESSION_SECRET || "default_secret_key_for_development",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./public" });
});

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

// Start server
app.listen(PORT, () => {
  console.log(`Server is Running on http://localhost:${PORT}`);
  swaggerDocs(app);
});
