import express from "express";
import connectDb from "./config/DbConnect.js";
import { ConfigENV } from "./config/index.js";
import cookieParser from "cookie-parser";
import AuthRouter from "./routes/authRoutes.js";

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

// app.use(session({
//   secret: ConfigENV.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === "production",
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000 // 24 hours
//   }
// }));

app.use("/api/v1/user", AuthRouter);

app.listen(PORT, () => {
  console.log(`Server is Running on http://localhost:${PORT}`);
});
