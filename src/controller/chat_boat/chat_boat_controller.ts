import { ChatBoat } from "../../entities/chat_boat.entity";
import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { Request, Response } from "express";
import { RoutesHandler } from "../../utils/error_handler";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";

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
      console.log(err);
    }
  }

  // get all chat by user id
  public async getUserChatById(req: Request, res: Response) {
    try {
      const chatId = req.params.id; // chatId and userId are same

      const getChat = await this.chatBoatRepo.find({
        where: { chat_id: chatId },
        order: { createdAt: "ASC" },
        select: ["id", "chat_id", "message", "sender_id", "receiver_id", "createdAt"],
      });
      if (getChat.length == 0) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This user chat"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA(`User chat`), ResponseCodes.success, getChat);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get user chat
  public async getAllUserChat(req: Request, res: Response) {
    try {
      // const userId = req.params.id; // userId
      // const chatId = req.params.id; // chatId and userId are same

      const getChat = await this.chatBoatRepo.query(`
  SELECT 
      chat_boat.chat_id,
      JSON_AGG(
          JSON_BUILD_OBJECT(
              'sender_id', chat_boat.sender_id,
              'receiver_id', chat_boat.receiver_id,
              'message', chat_boat.message,
              'createdAt', chat_boat."createdAt"  -- Using double quotes for case sensitivity
          )
      ) AS messages
  FROM 
      chat_boat
  GROUP BY 
      chat_boat.chat_id
  ORDER BY 
      MIN(chat_boat."createdAt") ASC;  -- Using double quotes for case sensitivity
`);

      if (getChat?.length == 0) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This user chat"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA(`User chat`), ResponseCodes.success, getChat);
    } catch (error) {
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

      await this.chatBoatRepo.save(chatBoatMessage);
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS(`User chat replay`), ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
    }
  }
}
