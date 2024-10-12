import { Repository } from "typeorm";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { RoutesHandler } from "../../utils/error_handler";
import { ChatBoat } from "../../entities/chat_boat.entity";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { getPagination, getPagingData } from "../../services/paginate";
import logger from "../../utils/winston";

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
      await this.chatBoatRepo.save(chatBoatMessage);
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
        select: ["id", "chat_id", "message", "sender_id", "receiver_id", "createdAt"],
      });

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA(`User chat`), ResponseCodes.success, getChat);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get user chat
  public async getAllUserChat(req: Request, res: Response) {
    try {
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

      return RoutesHandler.sendSuccess(req, res, true, "Chat data retrieved successfully", ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message || "Internal server error", ResponseCodes.serverError);
    }
  }

  // add replay to user
  public async addreplayToUser(req: Request, res: Response) {
    try {
      const { chat_id, user_id, msg } = req.body;
      const chatBoatMessage = new ChatBoat();

      chatBoatMessage.chat_id = chat_id;
      chatBoatMessage.sender_id = process.env.ADMIN_CHATBOAT_ID;
      chatBoatMessage.receiver_id = user_id;
      chatBoatMessage.message = msg;

      await this.chatBoatRepo.save(chatBoatMessage);
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS(`User chat replay`), ResponseCodes.success, undefined);
    } catch (error) {
      logger.error(error);
    }
  }
}
