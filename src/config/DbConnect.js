import mongoose from "mongoose";
import { ConfigENV } from "./index.js";

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(
      `${ConfigENV.MONGO_URI}/${ConfigENV.DB_NAME}`
    );
    console.log(`MongoDB Connected:${conn.connection.host}`);
  } catch (error) {
    console.log(`Error:${error.message}`);
    process.exit(1);
  }
};

export default connectDb;
