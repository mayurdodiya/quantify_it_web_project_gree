import { Not, Repository } from "typeorm";
import { Status } from "../../utils/enum";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { FeaturedServices } from "../../entities/featured_services.entity";

export class FeaturedServicesController {
  private featuredServicesRepo: Repository<FeaturedServices>;

  constructor() {
    this.featuredServicesRepo = AppDataSource.getRepository(FeaturedServices);
  }

  // add data
  public addFeaturedServices = async (req: Request, res: Response) => {
    try {
      const { title, description, logo_img_url } = req.body;
      const getData = await this.featuredServicesRepo.findOne({
        where: { title: title },
      });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This featured service"), ResponseCodes.alreadyExist);
      }

      const featuredService = new FeaturedServices();

      featuredService.title = title;
      featuredService.description = description;
      featuredService.logo_img_url = logo_img_url;

      const data = await this.featuredServicesRepo.save(featuredService);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("featured service data"), ResponseCodes.insertError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Featured service"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateFeaturedServices(req: Request, res: Response) {
    try {
      const { title, description, logo_img_url } = req.body;

      const dataId = req.params.id;
      const getData = await this.featuredServicesRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This featured service"), ResponseCodes.notFound);
      }

      const isExist = await this.featuredServicesRepo.findOne({
        where: { title: title, id: Not(dataId) },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This featured service"), ResponseCodes.alreadyExist);
      }

      getData.title = title || getData.title;
      getData.description = description || getData.description;
      getData.logo_img_url = logo_img_url || getData.logo_img_url;

      const data = await this.featuredServicesRepo.save(getData);

      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("featured service data"), ResponseCodes.saveError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Featured service"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getFeaturedServices(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const data = await this.featuredServicesRepo.findOne({
        where: { id: dataId, status: Status.ACTIVE },
        select: ["id", "title", "description", "logo_img_url", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This featured service"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Featured service"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllFeaturedServices(req: Request, res: Response) {
    try {
      const data = await this.featuredServicesRepo.find({
        where: { status: Status.ACTIVE },
        select: ["id", "title", "description", "logo_img_url", "createdAt", "updatedAt"],
      });

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Featured service"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeFeaturedServices(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const getData = await this.featuredServicesRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This featured service"), ResponseCodes.notFound);
      }
      const data = await this.featuredServicesRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This featured service"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Featured service"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
