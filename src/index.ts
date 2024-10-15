import http from "http";
import app from "./app";
// import "./config/redis.config";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import logger from "./utils/winston";
import method from "./utils/chatboat_question_ans";
import { PORT, ADMIN_CHATBOAT_ID } from "./config/variables/common.json";
import { ChatBoatController } from "./controller/chat_boat/chat_boat_controller";

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socketIo) => {
  let userId = "";
  const adminId = ADMIN_CHATBOAT_ID;
  let chatId = "";
  logger.info("user connected");

  socketIo.on("genIdFlag", () => {
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
        io.emit("serMsgEvent", {
          message: method.question1,
          senderId: userId,
          receiverId: adminId,
        });
        chatBoatController
          .chatCreate({
            chatId: chatId,
            message: method.question1,
            senderId: userId,
            receiverId: adminId,
          })
          .then(() => {
            io.emit("serMsgEvent", {
              message: method.answer1,
              senderId: adminId,
              receiverId: userId,
            });
            chatBoatController.chatCreate({
              chatId: chatId,
              message: method.answer1,
              senderId: adminId,
              receiverId: userId,
            });
          })
          .catch((error) => {
            logger.error(error);
          });
        break;
      case method.question2:
        userId = data.senderId;
        io.emit("serMsgEvent", {
          message: method.question2,
          senderId: userId,
          receiverId: adminId,
        });
        chatBoatController
          .chatCreate({
            chatId: userId,
            message: method.question2,
            senderId: userId,
            receiverId: adminId,
          })
          .then(() => {
            io.emit("serMsgEvent", {
              message: method.answer2,
              senderId: adminId,
              receiverId: userId,
            });
            chatBoatController.chatCreate({
              chatId: userId,
              message: method.answer2,
              senderId: adminId,
              receiverId: userId,
            });
          })
          .catch((error) => {
            logger.error(error);
          });
        break;
      default:
        userId = data.senderId;
        chatId = data.chatId;
        io.emit("serMsgEvent", {
          message: data.message,
          senderId: data.senderId,
          receiverId: data.receiverId,
        });
        chatBoatController.chatCreate({
          message: data.message,
          chatId: chatId,
          senderId: data.senderId,
          receiverId: data.receiverId,
        });
        break;
    }
  });

  socketIo.on("disconnect", async () => {
    logger.info("user disconnect");
  });
});

const initializeServer = () => {
  server.listen(PORT, async () => {
    logger.info(`Server start on http://localhost:${PORT}`);
  });
};

initializeServer();
