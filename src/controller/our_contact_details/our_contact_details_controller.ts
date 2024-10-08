import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { OurContactDetails } from "../../entities/our_contact_details.entity";

export class OurContactDetailsController {
  private ourContactDetailsRepo: Repository<OurContactDetails>;

  constructor() {
    this.ourContactDetailsRepo = AppDataSource.getRepository(OurContactDetails);
  }

  // add data
  public addData = async (req: Request, res: Response) => {
    try {
      const { email, location, address } = req.body as {
        email: string;
        location: string;
        address: string;
      };
      const phone_no: string = req.body.phone_no;
      const getData = await this.ourContactDetailsRepo.findOne({
        where: { id: 1 },
      });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.ADD_ONCE("Our contact details data"), ResponseCodes.insertError);
      }

      const visionExp = new OurContactDetails();

      visionExp.phone_no = phone_no;
      visionExp.email = email;
      visionExp.location = location;
      visionExp.address = address;
      await this.ourContactDetailsRepo.save(visionExp);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Our contact details"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateData(req: Request, res: Response) {
    try {
      const { phone_no, email, location, address } = req.body;

      const getData = await this.ourContactDetailsRepo.findOne({
        where: { id: 1 },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This our contact details"), ResponseCodes.notFound);
      }

      getData.phone_no = phone_no || getData.phone_no;
      getData.email = email || getData.email;
      getData.location = location || getData.location;
      getData.address = address || getData.address;
      this.ourContactDetailsRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Our contact details"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getData(req: Request, res: Response) {
    try {
      const data = await this.ourContactDetailsRepo.findOne({
        where: { id: 1 },
        select: ["id", "phone_no", "email", "address", "createdAt", "updatedAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This our contact details"), ResponseCodes.notFound);
      }
      // JSON.parse()
      JSON.stringify(data);
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Our contact details"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeData(req: Request, res: Response) {
    try {
      const data = await this.ourContactDetailsRepo.softDelete({ id: 1 });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This our contact details"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Our contact details"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
