// src/app.js - Updated version with enhanced account routes
import express from "express";
import connectDb from "./config/DbConnect.js";
import { ConfigENV } from "./config/index.js";
import cookieParser from "cookie-parser";
import AuthRouter from "./routes/authRoutes.js";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import "./config/passport.js";
import swaggerDocs from "./config/swagger.js";
import DataRouter from "./routes/dataRoutes.js";
import ClientRouter from "./routes/clientRoutes.js";
import AccountRoute from "./routes/AccountRoutes.js"; // Enhanced Account Routes
import TransactionRouter from "./routes/TransactionRoutes.js";

const PORT = ConfigENV.PORT || 7000;
const app = express();

connectDb();

app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true,
  })
);

app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: ConfigENV.SESSION_SECRET || "default_secret_key_for_development",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.get("/csv-import", (req, res) => {
  res.sendFile("csv-upload.html", { root: "./public" });
});

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./public" });
});

// Route definitions with enhanced role-based access
app.use("/auth", AuthRouter);
app.use("/api/v1/user", AuthRouter);
app.use("/data", DataRouter);
app.use("/clients", ClientRouter);
app.use("/accounts", AccountRoute); // Enhanced Account Routes with role-based access
app.use("/transaction", TransactionRouter);

// Enhanced error handler to better display validation errors
app.use((err, req, res, next) => {
  console.error("Error occurred:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  // Format validation errors for better frontend display
  const formattedErrors = {};
  if (errors && errors.length > 0) {
    errors.forEach((error) => {
      // Handle different error formats
      if (error.path && error.msg) {
        formattedErrors[error.path] = error.msg;
      } else if (error.param && error.msg) {
        formattedErrors[error.param] = error.msg;
      } else if (typeof error === "string") {
        formattedErrors.general = error;
      }
    });
  }

  // Role-based error handling
  const responseData = {
    success: false,
    message,
    ...(statusCode === 403 && {
      errorType: "PERMISSION_DENIED",
      suggestedAction:
        "Please check your role permissions or contact an administrator",
    }),
    ...(statusCode === 401 && {
      errorType: "AUTHENTICATION_REQUIRED",
      suggestedAction: "Please log in to access this resource",
    }),
    errors: Object.keys(formattedErrors).length > 0 ? formattedErrors : errors,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    responseData.stack = err.stack;
    responseData.timestamp = new Date().toISOString();
  }

  res.status(statusCode).json(responseData);
});

// Global 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errorType: "ROUTE_NOT_FOUND",
    suggestedAction: "Please check the API documentation for available routes",
  });
});

app.listen(PORT, () => {
  console.log(`Server is Running on http://localhost:${PORT}`);
  console.log(`Enhanced role-based account management system initialized`);
  swaggerDocs(app);
});

export default app;
