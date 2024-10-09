import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import bodyparser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import Routes from "./routes";
import http from "http";
import { Server } from "socket.io";
import method from "./utils/chatboat_question_ans";
import { ChatBoatController } from "./controller/chat_boat/chat_boat_controller";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
export const app = express();

// Middleware
app.use(cors({ origin: "*" }));

app.use(bodyparser.json()); // use when you data pass as json(from body)
app.use(express.urlencoded({ extended: true })); // use when your data pass from HTML form
app.use(morgan("tiny"));

// const authenticate = (req: Request, res: Response, next: NextFunction) => {
//   const isAuthenticated = checkAuthentication(req);
//   if (isAuthenticated) {
//     next();
//   } else {
//     res.status(403).json({
//       message: "Authentication required",
//     });
//   }
// };

// const checkAuthentication = (req: Request) => {
//   const origin = req.headers.origin;

//   if (!origin) {
//     return false;
//   }
//   const origins = process.env.FRONTEND_BASE_URL;
//   if (origin !== origins) {
//     return false;
//   }
//   return true;
// };

const setGlobalOriginHeader = (req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
};

app.use(setGlobalOriginHeader);

app.use("/uploads/image", express.static("uploads/image"));
app.use("/api", Routes);
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "*",
    credentials: true,
  })
);
// app.use("/api/v1", authenticate, Routes);

// socket.io
const server = http.createServer(app);
const io = new Server(server);

app.get("/", (req: Request, res: Response) => {
  // res.send("Welcome to Quantify It project!");
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

// socket.io
io.on("connection", (socketIo) => {
  let userId = "";
  const adminId = process.env.ADMIN_CHATBOAT_ID; // gree admin id
  let chatId = "";

  // chat open and ide check and generate
  socketIo.on("genIdFlag", (genId) => {
    const id = `id-${uuidv4()}`;
    io.emit("serGenretedId", id);
  });
  socketIo.on("htmlMyIdIs", (myId) => {
    userId = myId;
    chatId = userId;
  });

  const chatBoatController = new ChatBoatController();
  socketIo.on("htmlMyEve", (data) => {
    switch (data.message) {
      case method.question1:
        userId = data.senderId;
        io.emit("serMsgEvent", { message: method.question1, senderId: userId, receiverId: adminId });
        // chatBoatController.chatCreate(chatId, userId, adminId, method.question1)
        chatBoatController
          .chatCreate({ chatId: chatId, message: method.question1, senderId: userId, receiverId: adminId })

          .then(() => {
            io.emit("serMsgEvent", { message: method.answer1, senderId: adminId, receiverId: userId });
            // chatBoatController.chatCreate(chatId, adminId, userId, method.answer1);
            chatBoatController.chatCreate({ chatId: chatId, message: method.answer1, senderId: adminId, receiverId: userId });
          })
          .catch((err) => {
            console.log(err);
          });

        break;
      case method.question2:
        userId = data.senderId;

        io.emit("serMsgEvent", { message: method.question2, senderId: userId, receiverId: adminId });
        // chatBoatController.chatCreate(chatId, userId, adminId, method.question2)
        chatBoatController
          .chatCreate({ chatId: userId, message: method.question2, senderId: userId, receiverId: adminId })
          .then(() => {
            io.emit("serMsgEvent", { message: method.answer2, senderId: adminId, receiverId: userId });
            // chatBoatController.chatCreate(chatId, adminId, userId, method.answer2);
            chatBoatController.chatCreate({ chatId: userId, message: method.answer2, senderId: adminId, receiverId: userId });
          })
          .catch((err) => {
            console.log(err);
          });
        break;
    }

    if (data.message != method.question1 && data.message != method.question2 && data.message != method.question3 && data.message != method.question4 && data.message != method.question5) {
      console.log("if condition called!");
      userId = data.senderId;
      chatId = data.chatId;
      io.emit("serMsgEvent", { message: data.message, senderId: data.senderId, receiverId: data.receiverId });

      // chatBoatController.chatCreate(chatId, userId, adminId, data.message);
      chatBoatController.chatCreate({ message: data.message, chatId: chatId, senderId: data.senderId, receiverId: data.receiverId });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on ---> http://localhost:${PORT}`);
});
