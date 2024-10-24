import http from "http";
import app from "./app";
// import "./config/redis.config";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import logger from "./utils/winston";
import method from "./utils/chatboat_question_ans";
import { PORT } from "./config/variables/common.json";
import { ChatBoatController } from "./controller/chat_boat/chat_boat_controller";
import { ADMIN_CHAT_BOAT_ID } from "./config/variables/admin.json";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: "GET, POST, PATCH, DELETE",
  },
});

// io.on("connection", (socketIo) => {
//   let userId = "";
//   const adminId = ADMIN_CHATBOAT_ID;
//   let chatId = "";
//   logger.info("user connected");

//   socketIo.on("genIdFlag", () => {
//     const id = `id-${uuidv4()}`;
//     io.emit("serGenretedId", id);
//   });

//   socketIo.on("htmlMyIdIs", (myId) => {
//     userId = myId;
//     chatId = userId;
//   });

//   const chatBoatController = new ChatBoatController();

//   socketIo.on("htmlMyEve", (data) => {
//     switch (data.message) {
//       case method.question1:
//         userId = data.senderId;
//         io.emit("serMsgEvent", {
//           message: method.question1,
//           senderId: userId,
//           receiverId: adminId,
//         });
//         chatBoatController
//           .chatCreate({
//             chatId: chatId,
//             message: method.question1,
//             senderId: userId,
//             receiverId: adminId,
//           })
//           .then(() => {
//             io.emit("serMsgEvent", {
//               message: method.answer1,
//               senderId: adminId,
//               receiverId: userId,
//             });
//             chatBoatController.chatCreate({
//               chatId: chatId,
//               message: method.answer1,
//               senderId: adminId,
//               receiverId: userId,
//             });
//           })
//           .catch((error) => {
//             logger.error(error);
//           });
//         break;
//       case method.question2:
//         userId = data.senderId;
//         io.emit("serMsgEvent", {
//           message: method.question2,
//           senderId: userId,
//           receiverId: adminId,
//         });
//         chatBoatController
//           .chatCreate({
//             chatId: userId,
//             message: method.question2,
//             senderId: userId,
//             receiverId: adminId,
//           })
//           .then(() => {
//             io.emit("serMsgEvent", {
//               message: method.answer2,
//               senderId: adminId,
//               receiverId: userId,
//             });
//             chatBoatController.chatCreate({
//               chatId: userId,
//               message: method.answer2,
//               senderId: adminId,
//               receiverId: userId,
//             });
//           })
//           .catch((error) => {
//             logger.error(error);
//           });
//         break;
//       default:
//         userId = data.senderId;
//         chatId = data.chatId;
//         io.emit("serMsgEvent", {
//           message: data.message,
//           senderId: data.senderId,
//           receiverId: data.receiverId,
//         });
//         chatBoatController.chatCreate({
//           message: data.message,
//           chatId: chatId,
//           senderId: data.senderId,
//           receiverId: data.receiverId,
//         });
//         break;
//     }
//   });

//   socketIo.on("disconnect", async () => {
//     logger.info("user disconnect");
//   });
// });

// socket.io
io.on("connection", (socketIo) => {
  let userId = "";
  const adminId = ADMIN_CHAT_BOAT_ID; // gree admin id
  let chatId = "";

  // chat open and ide check and generate
  socketIo.on("genIdFlag", () => {
    const id = `id-${uuidv4()}`;
    io.emit("serGenretedId", id);
  });

  socketIo.on("htmlMyIdIs", (myId) => {
    userId = myId;
    chatId = userId;
  });

  const chatBoatController = new ChatBoatController();
  socketIo.on("htmlMyEve", async (data) => {
    switch (data.message) {
      case method.question1:
        userId = data.senderId;
        io.emit("serMsgEvent", { message: method.question1, senderId: userId, receiverId: adminId });
        chatBoatController
          .chatCreate({ chatId: chatId, message: method.question1, senderId: userId, receiverId: adminId })

          .then(() => {
            io.emit("serMsgEvent", { message: method.answer1, senderId: adminId, receiverId: userId });
            chatBoatController.chatCreate({ chatId: chatId, message: method.answer1, senderId: adminId, receiverId: userId });
          })
          .catch((err) => {
            logger.error(err);
          });

        break;
      case method.question2:
        userId = data.senderId;

        io.emit("serMsgEvent", { message: method.question2, senderId: userId, receiverId: adminId });
        chatBoatController
          .chatCreate({ chatId: userId, message: method.question2, senderId: userId, receiverId: adminId })
          .then(() => {
            io.emit("serMsgEvent", { message: method.answer2, senderId: adminId, receiverId: userId });
            chatBoatController.chatCreate({ chatId: userId, message: method.answer2, senderId: adminId, receiverId: userId });
          })
          .catch((err) => {
            logger.error(err);
          });
        break;
    }

    if (data.message != method.question1 && data.message != method.question2 && data.message != method.question3 && data.message != method.question4 && data.message != method.question5) {
      userId = data.senderId;
      chatId = data.chatId;

      var sendmsg = await chatBoatController.chatCreate({ message: data.message, chatId: chatId, senderId: data.senderId, receiverId: data.receiverId });
      if (sendmsg == true) {
        io.emit("serMsgEvent", { message: data.message, senderId: data.senderId, receiverId: data.receiverId });
      }
    }
  });
});

const initializeServer = () => {
  server.listen(PORT, async () => {
    logger.info(`Server start on http://localhost:${PORT}`);
  });
};

initializeServer();

// {
//   "HOST": "aws-0-ap-south-1.pooler.supabase.com",
//   "DATABASE_PORT": "6543",
//   "USER_NAME": "postgres.vtzwwasnuycnxpgrpfuz",
//   "PASSWORD": "Abc@123.com",
//   "DATABASE": "postgres"
// }
