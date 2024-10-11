import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import bodyparser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import Routes from "./routes";
import path from "path";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.use("/uploads/image", express.static("uploads/image"));
app.use("/api", Routes);

const setGlobalOriginHeader = (req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
};

app.use(setGlobalOriginHeader);

app.get("/", (req: Request, res: Response) => {
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

export default app;
