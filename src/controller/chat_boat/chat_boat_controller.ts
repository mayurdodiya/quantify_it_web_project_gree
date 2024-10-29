import { Repository } from "typeorm";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { RoutesHandler } from "../../utils/error_handler";
import { ChatBoat } from "../../entities/chat_boat.entity";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { getPagination, getPagingData } from "../../services/paginate";
import logger from "../../utils/winston";
import { ADMIN_CHAT_BOAT_ID } from "./../../config/variables/admin.json";
import method from "../../utils/chatboat_question_ans";
import { NotificationController } from "./../notification/notification_controller";
import { networkUtils } from "../../utils/ip_address";
const notificationController = new NotificationController();

export class ChatBoatController {
  chatBoatRepo: Repository<ChatBoat>;
  constructor() {
    this.chatBoatRepo = AppDataSource.getRepository(ChatBoat);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async chatCreate(data: any) {
    try {
      const chatBoatMessage = new ChatBoat();
      chatBoatMessage.chat_id = data.chatId;
      chatBoatMessage.sender_id = data.senderId;
      chatBoatMessage.receiver_id = data.receiverId;
      chatBoatMessage.message = data.message;
      chatBoatMessage.image_url = data.image_url;

      const addMsg = await this.chatBoatRepo.save(chatBoatMessage);

      return addMsg;
    } catch (err) {
      logger.error(err);
    }
  }

  // send msg
  public async sendMsg(req: Request, res: Response) {
    const data = req.body;

    try {
      // add ip address
      const userIp = (req.headers["x-forwarded-for"] as string) || req.connection.remoteAddress;
      const ipAddress = networkUtils.getMappedIp(userIp);

      const chatBoatMessage = new ChatBoat();
      chatBoatMessage.chat_id = data.chatId;
      chatBoatMessage.sender_id = data.senderId;
      chatBoatMessage.receiver_id = data.receiverId;
      chatBoatMessage.message = data.message;
      chatBoatMessage.image_url = data.image_url;
      chatBoatMessage.user_ip_address = ipAddress;

      const addMsg = await this.chatBoatRepo.save(chatBoatMessage);

      // send notification to admin
      if (data.receiverId == ADMIN_CHAT_BOAT_ID) {
        await notificationController.addNotification(data.senderId, data.receiverId, data.message, data.image_url, ipAddress);
      }

      const defaultQuestions = method;

      const result = defaultQuestions.find((item) => item.question === data.message);
      if (result) {
        const chatBoatMessagea = new ChatBoat();
        chatBoatMessagea.chat_id = data.chatId;
        chatBoatMessagea.sender_id = data.receiverId;
        chatBoatMessagea.receiver_id = data.senderId;
        chatBoatMessagea.message = result.answer;
        chatBoatMessagea.image_url = data.image_url;
        chatBoatMessage.user_ip_address = data.ipAddress;

        const replyMsg = await this.chatBoatRepo.save(chatBoatMessagea);

        return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS(`chat reply`), ResponseCodes.success, { addMsg, replyMsg });
      }

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS(`chat`), ResponseCodes.success, addMsg);
    } catch (err) {
      return RoutesHandler.sendError(req, res, false, err.message, ResponseCodes.serverError);
    }
  }

  // get all chat by user id
  public async getUserChatById(req: Request, res: Response) {
    try {
      const chatId = req.params.id;

      const getChat = await this.chatBoatRepo.find({
        where: { chat_id: chatId },
        order: { createdAt: "ASC" },
        select: ["chat_id", "message", "image_url", "sender_id", "receiver_id", "user_ip_address", "createdAt"],
      });

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA(`User chat`), ResponseCodes.success, getChat);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get user chat
  public async getAllUserChat(req: Request, res: Response) {
    try {
      // const cachedChats = await redisClient.get("all_user_chats");

      // if (cachedChats) {
      //   return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Chat"), ResponseCodes.success, JSON.parse(cachedChats));
      // }
      const { page = 1, size = 10, s = "" } = req.query;

      const pageData = parseInt(page as string, 10);
      const sizeData = parseInt(size as string, 10);
      const { limit, offset } = getPagination(pageData, sizeData);

      let searchCondition = "";
      if (s) {
        searchCondition = `
        WHERE 
          chat_boat.sender_id ILIKE '%${s}%' OR 
          chat_boat.receiver_id ILIKE '%${s}%' OR 
          chat_boat.message::text ILIKE '%${s}%'
      `;
      }

      const getChat = await this.chatBoatRepo.query(`
      SELECT 
          chat_boat.chat_id,
          JSON_AGG(
              JSON_BUILD_OBJECT(
                  'sender_id', chat_boat.sender_id,
                  'receiver_id', chat_boat.receiver_id,
                  'message', chat_boat.message,
                  'image_url', chat_boat.image_url,
                  'createdAt', chat_boat."createdAt"
              )
          ) AS messages
      FROM 
          chat_boat
      ${searchCondition}  -- Add search condition here
      GROUP BY 
          chat_boat.chat_id
      ORDER BY 
          MIN(chat_boat."createdAt") ASC
      LIMIT ${limit} OFFSET ${offset};
    `);

      const totalChats = await this.chatBoatRepo.query(`
      SELECT COUNT(DISTINCT chat_id) AS totalItems 
      FROM chat_boat 
      ${searchCondition};  -- Add search condition here
    `);

      const totalItems = parseInt(totalChats[0].totalitems, 10);

      const alldata = {
        count: totalItems,
        rows: getChat,
      };

      const response = getPagingData(alldata, pageData, limit);
      // await redisClient.setEx("all_user_chats", 3600, JSON.stringify(response));

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Chat"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get last msg
  public async getAllUserLastMSG(req: Request, res: Response) {
    try {
      const chats = await this.chatBoatRepo
        .createQueryBuilder("chat")
        .select("chat.chat_id", "chat_id")
        .addSelect("chat.sender_id", "sender_id")
        .addSelect("chat.receiver_id", "receiver_id")
        .addSelect("chat.message", "message")
        .addSelect("chat.image_url", "image_url")
        .addSelect("chat.isRead", "isRead")
        .addSelect("chat.user_ip_address", "user_ip_address")
        .addSelect("chat.createdAt", "createdAt")
        // .where(
        //   'chat.createdAt IN (SELECT MAX(inner_chat."createdAt") FROM chat_boat AS inner_chat WHERE inner_chat.chat_id = chat.chat_id GROUP BY inner_chat.chat_id)',
        // )
        .orderBy("chat.createdAt", "DESC")
        .getRawMany(); // Get the last message per chat_id

      const result = chats.reduce((acc, chat) => {
        const chatEntry = acc.find((entry) => entry.chat_id === chat.chat_id);

        if (chatEntry) {
          chatEntry.messages.sender_id = chat.sender_id;
          chatEntry.messages.receiver_id = chat.receiver_id;
          chatEntry.messages.message = chat.message;
          chatEntry.messages.image_url = chat.image_url;
          chatEntry.messages.isRead = chat.isRead;
          chatEntry.messages.user_ip_address = chat.user_ip_address;
          chatEntry.messages.createdAt = chat.createdAt;

          // chatEntry.messages.push({
          //   sender_id: chat.sender_id,
          //   receiver_id: chat.receiver_id,
          //   message: chat.message,
          //   image_url: chat.image_url,
          //   isRead: chat.isRead,
          //   createdAt: chat.createdAt,
          // });
        } else {
          acc.push({
            chat_id: chat.chat_id,
            messages: [
              {
                sender_id: chat.sender_id,
                receiver_id: chat.receiver_id,
                message: chat.message,
                image_url: chat.image_url,
                isRead: chat.isRead,
                user_ip_address: chat.user_ip_address,
                createdAt: chat.createdAt,
              },
            ],
          });
        }
        return acc;
      }, []);

      // user want to add in responce chat_id isRead false messge count

      const result1 = await Promise.all(
        result
          .sort((a, b) => b.messages[0].createdAt - a.messages[0].createdAt)
          .map(async (chat) => {
            const unreadCount = chats.filter((message) => message.chat_id === chat.chat_id && !message.isRead).length;

            chat.unreadCount = unreadCount || 0;

            return chat;
          })
      );

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA(`Chat`), ResponseCodes.success, result1);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // add replay to user
  public async addreplayToUser(req: Request, res: Response) {
    try {
      const { chat_id, user_id, msg } = req.body;
      const chatBoatMessage = new ChatBoat();

      chatBoatMessage.chat_id = chat_id;
      chatBoatMessage.sender_id = ADMIN_CHAT_BOAT_ID;
      chatBoatMessage.receiver_id = user_id;
      chatBoatMessage.message = msg;

      await this.chatBoatRepo.save(chatBoatMessage);
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS(`User chat replay`), ResponseCodes.success, undefined);
    } catch (error) {
      logger.error(error);
    }
  }

  // mark as read
  public async markAsRead(req: Request, res: Response) {
    try {
      const { chat_id, senderId, receiverId } = req.body;

      if (!senderId || !receiverId || !chat_id) {
        return res.status(ResponseCodes.badRequest).json({ message: "Missing required parameters." });
      }

      const messageRepository = await this.chatBoatRepo;

      await messageRepository
        .createQueryBuilder()
        .update(ChatBoat)
        .set({ isRead: true })
        .where("(chat_id = :chat_id) OR (sender_id = :senderId AND receiver_id = :receiverId) OR (sender_id = :receiverId AND receiver_id = :senderId)", {
          chat_id,
          senderId,
          receiverId,
        })
        .execute();

      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY(`Chat`), ResponseCodes.success, {});
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
