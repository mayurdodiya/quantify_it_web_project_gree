import "reflect-metadata";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import Routes from "./routes";
import bodyparser from "body-parser";
import express, { NextFunction, Request, Response } from "express";

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

// app.post("/sendmail", async (req, res) => {
//   try {
//     await emailService.sendEmail("mailtesttrainer1@mailinator.com", "Test Mail", "This is a test...", "<p>Test mail.....</p>");

//     res.status(200).json({ success: true, message: "Email sent successfully" });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to send email",
//       error: error.message,
//     });
//   }
// });

export default app;
