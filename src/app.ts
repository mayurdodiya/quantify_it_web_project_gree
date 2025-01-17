import "reflect-metadata";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import Routes from "./routes";
import bodyparser from "body-parser";
import express, { NextFunction, Request, Response } from "express";

const app = express();

app.use(cors({ origin: ["*", "https://quantifyitagency.com", "https://admin.quantifyitagency.com", "http://localhost:3000", "http://localhost:3004"] }));

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

// Handlebars setup
import { engine } from "express-handlebars";

// app.engine("handlebars", engine());
app.engine("handlebars", engine({ extname: ".handlebars", defaultLayout: false }));
app.set("view engine", "handlebars");
app.set("public", path.join(__dirname, "public"));



export default app;
