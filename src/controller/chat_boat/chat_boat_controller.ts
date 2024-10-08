import { ChatBoat } from "../../entities/chat_boat.entity";
import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { Request, Response } from "express";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";

export class ChatBoatController {
  chatBoatRepo: Repository<ChatBoat>;
  constructor() {
    this.chatBoatRepo = AppDataSource.getRepository(ChatBoat);
  }

  // create user chat
  public async chatCreate(chatId: any, senderId: any, receiverId: any, message: any) {
    try {
      const chatBoatMessage = new ChatBoat();
      chatBoatMessage.chat_id = chatId;
      chatBoatMessage.sender_id = senderId;
      chatBoatMessage.receiver_id = receiverId;
      chatBoatMessage.message = message;
      const dataAdd = await this.chatBoatRepo.save(chatBoatMessage);
    } catch (error) {
      console.log(error);
    }
  }

  // get all chat by user id
  public async getUserChatById(req: Request, res: Response) {
    try {
      const userId = req.params.id; // userId
      const chatId = req.params.id; // chatId and userId are same

      const getChat = await this.chatBoatRepo.find({ where: { chat_id: chatId }, order: { creadtedAt: "ASC" }, select: ["id", "chat_id", "message", "sender_id", "receiver_id", "creadtedAt"] });
      if (getChat.length == 0) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This user chat"), ResponseCodes.serverError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA(`User chat`), ResponseCodes.success, getChat);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get user chat
  public async getAllUserChat(req: Request, res: Response) {
    try {
      const userId = req.params.id; // userId
      const chatId = req.params.id; // chatId and userId are same

      const getChat = await this.chatBoatRepo.query(`
  SELECT 
      chat_boat.chat_id,
      JSON_AGG(
          JSON_BUILD_OBJECT(
              'sender_id', chat_boat.sender_id,
              'receiver_id', chat_boat.receiver_id,
              'message', chat_boat.message,
              'creadtedAt', chat_boat."creadtedAt"  -- Using double quotes for case sensitivity
          )
      ) AS messages
  FROM 
      chat_boat
  GROUP BY 
      chat_boat.chat_id
  ORDER BY 
      MIN(chat_boat."creadtedAt") ASC;  -- Using double quotes for case sensitivity
`);

      if (getChat.length == 0) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This user chat"), ResponseCodes.serverError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA(`User chat`), ResponseCodes.success, getChat);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all chat by user id
  public async addreplayToUser(req: Request, res: Response) {
    try {
      const { chat_id, user_id, msg } = req.body;
      const chatBoatMessage = new ChatBoat();

      chatBoatMessage.chat_id = chat_id;
      chatBoatMessage.sender_id = process.env.ADMIN_CHATBOAT_ID;
      chatBoatMessage.receiver_id = user_id;
      chatBoatMessage.message = msg;

      const addReplay = await this.chatBoatRepo.save(chatBoatMessage);
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS(`User chat replay`), ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
    }
  }
}
