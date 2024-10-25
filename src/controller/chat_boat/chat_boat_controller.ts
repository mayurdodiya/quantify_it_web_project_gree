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
// import { redisClient } from "../../config/redis.config";

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
      // if (!addMsg) {
      //   return false;
      // }

      // return true;
      return addMsg;
    } catch (err) {
      logger.error(err);
    }
  }

  // get all chat by user id
  public async getUserChatById(req: Request, res: Response) {
    try {
      const chatId = req.params.id;

      const getChat = await this.chatBoatRepo.find({
        where: { chat_id: chatId },
        order: { createdAt: "ASC" },
        select: ["chat_id", "message", "image_url", "sender_id", "receiver_id", "createdAt"],
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
      const chats = await this.chatBoatRepo.createQueryBuilder("chat").select("chat.chat_id", "chat_id").addSelect("chat.sender_id", "sender_id").addSelect("chat.receiver_id", "receiver_id").addSelect("chat.message", "message").addSelect("chat.image_url", "image_url").addSelect("chat.createdAt", "createdAt").where('chat.createdAt IN (SELECT MAX(inner_chat."createdAt") FROM chat_boat AS inner_chat WHERE inner_chat.chat_id = chat.chat_id GROUP BY inner_chat.chat_id)').getRawMany(); // Get the last message per chat_id

      const result = chats.reduce((acc, chat) => {
        const chatEntry = acc.find((entry) => entry.chat_id === chat.chat_id);
        if (chatEntry) {
          chatEntry.messages.push({
            sender_id: chat.sender_id,
            receiver_id: chat.receiver_id,
            message: chat.message,
            image_url: chat.image_url,
            createdAt: chat.createdAt,
          });
        } else {
          acc.push({
            chat_id: chat.chat_id,
            messages: [
              {
                sender_id: chat.sender_id,
                receiver_id: chat.receiver_id,
                message: chat.message,
                image_url: chat.image_url,
                createdAt: chat.createdAt,
              },
            ],
          });
        }
        return acc;
      }, []);

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA(`Chat`), ResponseCodes.success, result);
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
}
