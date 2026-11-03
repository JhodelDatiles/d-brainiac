import mongoose from "mongoose";
import { config } from "../envConfig.ts";

const conn = async (): Promise<void> => {
  await mongoose.connect(config.mongoUri);
  console.log("Successfully connected to DB!");
};

export default conn;
