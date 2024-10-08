import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { HowWeWork } from "../../entities/how_we_work.entity";
import { Status } from "../../utils/enum";

export class HowWeWorkController {
  private howWeWorkRepo: Repository<HowWeWork>;

  constructor() {
    this.howWeWorkRepo = AppDataSource.getRepository(HowWeWork);
  }

  // add data
  public addHowWeWork = async (req: Request, res: Response) => {
    try {
      const { title, description, logo_img_url } = req.body;
      const getData = await this.howWeWorkRepo.findOne({
        where: { title: title },
      });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This work data"), ResponseCodes.insertError);
      }

      const questionAnsData = new HowWeWork();

      questionAnsData.title = title;
      questionAnsData.description = description;
      questionAnsData.logo_img_url = logo_img_url;
      await this.howWeWorkRepo.save(questionAnsData);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Work data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateHowWeWork(req: Request, res: Response) {
    try {
      const { title, description, logo_img_url } = req.body;

      const dataId = req.params.id;
      const getData = await this.howWeWorkRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This work data"), ResponseCodes.notFound);
      }

      const isExist = await this.howWeWorkRepo.findOne({
        where: { title: title, id: Not(dataId) },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This work data"), ResponseCodes.alreadyExist);
      }
      getData.title = title || getData.title;
      getData.description = description || getData.description;
      getData.logo_img_url = logo_img_url || getData.logo_img_url;
      this.howWeWorkRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Work data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getHowWeWork(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const data = await this.howWeWorkRepo.findOne({
        where: { id: dataId, status: Status.ACTIVE },
        select: ["id", "title", "description", "logo_img_url", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This work data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Work data"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllHowWeWork(req: Request, res: Response) {
    try {
      const data = await this.howWeWorkRepo.find({
        where: { status: Status.ACTIVE },
        select: ["id", "title", "description", "logo_img_url", "createdAt", "updatedAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This work data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Work data"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeHowWeWork(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const getData = await this.howWeWorkRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This work data"), ResponseCodes.notFound);
      }
      const data = await this.howWeWorkRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This work data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Work data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
