import http from "http";
import app from "./app";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import logger from "./utils/winston";
// import method from "./utils/chatboat_question_ans";
import { PORT } from "./config/variables/common.json";
// import { ADMIN_CHAT_BOAT_ID } from "./config/variables/admin.json";
// import { ChatBoatController } from "./controller/chat_boat/chat_boat_controller";

// const chatBoatController = new ChatBoatController();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: "GET, POST, PATCH, DELETE",
  },
});

const userSockets = {};

io.on("connection", (socketIo) => {
  socketIo.on("registerUser", (userId) => {
    userSockets[userId] = socketIo.id;
  });

  socketIo.on("disconnect", () => {
    for (const [userId, socketId] of Object.entries(userSockets)) {
      if (socketId === socketIo.id) {
        delete userSockets[userId];
        break;
      }
    }
  });

  // let userId = "";
  // let chatId = "";
  // const adminId = ADMIN_CHAT_BOAT_ID;

  socketIo.on("genIdFlag", () => {
    const id = `id-${uuidv4()}`;
    socketIo.emit("serGenretedId", id);
  });

  // socketIo.on("htmlMyIdIs", (myId) => {
  // userId = myId;
  // chatId = userId;
  // });

  socketIo.on("htmlMyEve", async (data) => {
    const receiverId = data.receiver_id;

    // switch (data.message) {
    //   case method.question1:
    //     socketIo.to(userSockets[receiverId]).emit("serMsgEvent", { message: method.question1, senderId: userId, receiverId: adminId });
    //     chatBoatController
    //       .chatCreate({ chatId: chatId, message: method.question1, senderId: userId, receiverId: adminId })
    //       .then(() => {
    //         socketIo.to(userSockets[userId]).emit("serMsgEvent", { message: method.answer1, senderId: adminId, receiverId: userId });
    //         chatBoatController.chatCreate({ chatId: chatId, message: method.answer1, senderId: adminId, receiverId: userId });
    //       })
    //       .catch((err) => logger.error(err));
    //     break;

    //   case method.question2:
    //     socketIo.to(userSockets[receiverId]).emit("serMsgEvent", { message: method.question2, senderId: userId, receiverId: adminId });
    //     chatBoatController
    //       .chatCreate({ chatId: userId, message: method.question2, senderId: userId, receiverId: adminId })
    //       .then(() => {
    //         socketIo.to(userSockets[userId]).emit("serMsgEvent", { message: method.answer2, senderId: adminId, receiverId: userId });
    //         chatBoatController.chatCreate({ chatId: userId, message: method.answer2, senderId: adminId, receiverId: userId });
    //       })
    //       .catch((err) => logger.error(err));
    //     break;

    //   // default:
    //   //   chatId = data.chatId;
    //   // const sendmsg = await chatBoatController.chatCreate({ message: data.message, image_url: data.image_url || [], chatId: chatId, senderId: userId, receiverId: receiverId });

    //   // console.log(sendmsg, "------------------- sendmsg");

    //   // if (sendmsg) {
    //   // socketIo.broadcast.to(userSockets[receiverId]).emit("serMsgEvent", data);
    //   // }
    //   // break;
    // }

    await socketIo.broadcast.to(userSockets[receiverId]).emit("serMsgEvent", data);
  });
});

const initializeServer = () => {
  server.listen(PORT, async () => {
    logger.info(`Server start on http://localhost:${PORT}`);
  });
};

initializeServer();
