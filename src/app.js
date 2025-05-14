import express from "express";
import connectDb from "./config/DbConnect.js";
import { ConfigENV } from "./config/index.js";

const PORT = ConfigENV.PORT;

const app = express();

connectDb();
app.get("/", (req, res) => {
  res.send("Hello World! :)");
});

app.listen(PORT, () => {
  console.log(`Server is Running on http://localhost:${PORT}`);
});
