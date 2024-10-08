import { VisionExperties } from "../../entities/vision_experties.entity";
import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { Status } from "../../utils/enum";

export class VisionExpertiesController {
  private visionExpertiesRepo: Repository<VisionExperties>;

  constructor() {
    this.visionExpertiesRepo = AppDataSource.getRepository(VisionExperties);
  }

  // add data
  public addData = async (req: Request, res: Response) => {
    try {
      const { title, description, img_url } = req.body;
      const getData = await this.visionExpertiesRepo.findOne({ where: { title: title } });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This experties"), ResponseCodes.insertError);
      }

      const visionExp = new VisionExperties();

      visionExp.title = title;
      visionExp.description = description || null;
      visionExp.img_url = img_url || null;
      await this.visionExpertiesRepo.save(visionExp);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Experties"), ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateData(req: Request, res: Response) {
    try {
      const { title, description, img_url } = req.body;

      const dataId = parseInt(req.params.id);
      const getData = await this.visionExpertiesRepo.findOne({ where: { id: dataId } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This experties"), ResponseCodes.searchError);
      }
      const isExist = await this.visionExpertiesRepo.findOne({ where: { title: title, id: Not(dataId) } });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This experties"), ResponseCodes.searchError);
      }
      getData.title = title || getData.title;
      getData.description = description || getData.description;
      getData.img_url = img_url || getData.img_url;
      this.visionExpertiesRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Experties"), ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const data = await this.visionExpertiesRepo.findOne({ where: { id: dataId, status: Status.ACTIVE }, select: ["id", "title", "description", "img_url", "creadtedAt"] });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This experties"), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Experties"), ResponseCodes.success, data);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllData(req: Request, res: Response) {
    try {
      const data = await this.visionExpertiesRepo.find({ where: { status: Status.ACTIVE }, select: ["id", "title", "description", "img_url", "creadtedAt", "updatedAt"] });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This experties"), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Experties"), ResponseCodes.success, data);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const getData = await this.visionExpertiesRepo.findOne({ where: { id: dataId } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This experties"), ResponseCodes.searchError);
      }
      const data = await this.visionExpertiesRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This experties"), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Experties"), ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
