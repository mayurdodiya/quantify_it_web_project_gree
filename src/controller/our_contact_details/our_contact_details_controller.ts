import { Repository } from "typeorm";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { OurContactDetails } from "../../entities/our_contact_details.entity";

export class OurContactDetailsController {
  private ourContactDetailsRepo: Repository<OurContactDetails>;

  constructor() {
    this.ourContactDetailsRepo = AppDataSource.getRepository(OurContactDetails);
  }

  // add data
  public addOurContactDetails = async (req: Request, res: Response) => {
    try {
      const { email, location, address } = req.body as {
        email: string;
        location: string;
        address: string;
      };
      const phone_no: string = req.body.phone_no;
      const getData = await this.ourContactDetailsRepo.find({});
      if (getData.length) {
        return RoutesHandler.sendError(req, res, false, message.ADD_ONCE("Our contact details data"), ResponseCodes.insertError);
      }

      const visionExp = new OurContactDetails();

      visionExp.phone_no = phone_no;
      visionExp.email = email;
      visionExp.location = location;
      visionExp.address = address;
      const data = await this.ourContactDetailsRepo.save(visionExp);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("our contact details"), ResponseCodes.saveError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Our contact details"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateOurContactDetails(req: Request, res: Response) {
    try {
      const { phone_no, email, location, address } = req.body;
      const id = req.params.id;

      const getData = await this.ourContactDetailsRepo.findOne({
        where: { id: id },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This our contact details"), ResponseCodes.notFound);
      }

      getData.phone_no = phone_no || getData.phone_no;
      getData.email = email || getData.email;
      getData.location = location || getData.location;
      getData.address = address || getData.address;

      const data = await this.ourContactDetailsRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("our contact details"), ResponseCodes.saveError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Our contact details"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getOurContactDetails(req: Request, res: Response) {
    try {
      const data = await this.ourContactDetailsRepo.find({
        select: ["id", "phone_no", "email", "address"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This our contact details"), ResponseCodes.notFound);
      }

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Our contact details"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeContactDetails(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const data = await this.ourContactDetailsRepo.softDelete({ id: id });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This our contact details"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Our contact details"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
