import { VisionExperties } from "../../entities/vision_experties.entity";
import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
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
  public addVisionExperties = async (req: Request, res: Response) => {
    try {
      const { title, description, img_url } = req.body;
      const getData = await this.visionExpertiesRepo.findOne({
        where: { title: title },
      });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This experties"), ResponseCodes.alreadyExist);
      }

      const visionExp = new VisionExperties();

      visionExp.title = title;
      visionExp.description = description || null;
      visionExp.img_url = img_url || null;

      const data = await this.visionExpertiesRepo.save(visionExp);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("Experties"), ResponseCodes.saveError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Experties"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateVisionExperties(req: Request, res: Response) {
    try {
      const { title, description, img_url } = req.body;

      const dataId = req.params.id;
      const getData = await this.visionExpertiesRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This experties"), ResponseCodes.notFound);
      }
      const isExist = await this.visionExpertiesRepo.findOne({
        where: { title: title, id: Not(dataId) },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This experties"), ResponseCodes.alreadyExist);
      }
      getData.title = title || getData.title;
      getData.description = description || getData.description;
      getData.img_url = img_url || getData.img_url;

      const data = await this.visionExpertiesRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("Experties"), ResponseCodes.saveError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Experties"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getVisionExperties(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const data = await this.visionExpertiesRepo.findOne({
        where: { id: dataId, status: Status.ACTIVE },
        select: ["id", "title", "description", "img_url", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This experties"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Experties"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllVisionExperties(req: Request, res: Response) {
    try {
      const data = await this.visionExpertiesRepo.find({
        where: { status: Status.ACTIVE },
        select: ["id", "title", "description", "img_url", "createdAt", "updatedAt"],
      });
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Experties"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeVisionExperties(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const getData = await this.visionExpertiesRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This experties"), ResponseCodes.notFound);
      }
      const data = await this.visionExpertiesRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This experties"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Experties"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
