import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { ContactUs } from "../../entities/contact_us.entity";

export class ContactUsController {
  private contactUsRepo: Repository<ContactUs>;

  constructor() {
    this.contactUsRepo = AppDataSource.getRepository(ContactUs);
  }

  // add data
  public addContactUs = async (req: Request, res: Response) => {
    try {
      const { full_name, email, contact_purpose, user_message, budget } = req.body;

      const contactUsData = this.contactUsRepo.create({
        full_name: full_name,
        email: email,
        contact_purpose: contact_purpose,
        user_message: user_message,
        budget: budget,
      });
      await this.contactUsRepo.save(contactUsData);

      return RoutesHandler.sendSuccess(req, res, true, message.SUBMIT_FORM(), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // get data
  public async getContactUs(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const data = await this.contactUsRepo.findOne({
        where: { id: dataId },
        select: ["id", "full_name", "email", "contact_purpose", "user_message", "budget", "createdAt", "updatedAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This Contact us data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Contact us forms"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllContactUs(req: Request, res: Response) {
    try {
      const data = await this.contactUsRepo.find({
        select: ["id", "full_name", "email", "contact_purpose", "user_message", "budget", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This Contact us data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Contact us forms"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
