import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { Notification } from "../../entities/notification.entity";
import logger from "../../utils/winston";

export class NotificationController {
  private notificationRepo: Repository<Notification>;

  constructor() {
    this.notificationRepo = AppDataSource.getRepository(Notification);
  }

  // add only admin notification
  public addNotification = async (sender_id: string, receiver_id: string, message: string, image_url: string) => {
    try {
      const notificationData = new Notification();

      notificationData.sender_id = sender_id;
      notificationData.receiver_id = receiver_id;
      notificationData.message = message ? message : null;
      notificationData.image_url = image_url ? image_url : null;

      await this.notificationRepo.save(notificationData);
    } catch (error) {
      logger.error(error);
    }
  };

  // change notification status ( read, unread )
  public async notificationStatus(req: Request, res: Response) {
    try {
      const { is_read } = req.body;

      const dataId = req.params.id;
      const getData = await this.notificationRepo.findOne({ where: { id: dataId } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This notification"), ResponseCodes.notFound);
      }

      getData.is_read = is_read ? is_read : false;
      const data = await this.notificationRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("Notification status"), ResponseCodes.insertError);
      }

      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Notification status"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data by id
  public async getNotification(req: Request, res: Response) {
    try {
      const dataId = req.params.id as string;
      const data = await this.notificationRepo.findOne({
        where: { id: dataId },
        select: ["id", "sender_id", "receiver_id", "message", "image_url", "is_read"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This notification"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Notification"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllNotification(req: Request, res: Response) {
    try {
      const type: boolean = req.query.type === "true" ? true : false;
      let data: Notification[] = [];
      
      if (req.query.type != "") {
        const obj: { is_read: boolean } = { is_read: false };
        if (type) {
          obj.is_read = type;
        }
        data = await this.notificationRepo.find({
          where: obj,
          order: { createdAt: "DESC" },
          select: ["id", "sender_id", "receiver_id", "message", "image_url", "is_read"],
        });

        if (!data) {
          return RoutesHandler.sendError(req, res, false, message.NO_DATA("This notification"), ResponseCodes.notFound);
        }
      } else {
        data = await this.notificationRepo.find({
          // where: obj,
          order: { createdAt: "DESC" },
          select: ["id", "sender_id", "receiver_id", "message", "image_url", "is_read"],
        });

        if (!data) {
          return RoutesHandler.sendError(req, res, false, message.NO_DATA("This notification"), ResponseCodes.notFound);
        }
      }

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Notification"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
