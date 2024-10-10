import { Repository } from "typeorm";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
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

      const contactUsData = new ContactUs();

      contactUsData.full_name = full_name;
      contactUsData.email = email;
      contactUsData.contact_purpose = contact_purpose;
      contactUsData.user_message = user_message;
      contactUsData.budget = budget;

      const data = await this.contactUsRepo.save(contactUsData);

      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("contact us data"), ResponseCodes.insertError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.SUBMIT_FORM, ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // get data
  public async getContactUs(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
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
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Contact us forms"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
