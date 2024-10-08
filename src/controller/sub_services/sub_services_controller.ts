import { CoreServices } from "../../entities/core_services.entity";
import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { SubServices } from "../../entities/sub_services.entity";

interface SubServicesItem {
  sub_service_name: string;
  description_title: string;
  description: string;
}

export class SubServicesController {
  private subServicesRepo: Repository<SubServices>;
  private coreServicesRepo: Repository<CoreServices>;

  constructor() {
    this.subServicesRepo = AppDataSource.getRepository(SubServices);
    this.coreServicesRepo = AppDataSource.getRepository(CoreServices);
  }

  // add data
  public addSubServices= async (req: Request, res: Response) => {
    try {
      const { sub_service_name, core_service_id } = req.body;
      const getData = await this.subServicesRepo.findOne({
        where: { sub_service_name: sub_service_name },
      });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This sub services"), ResponseCodes.insertError);
      }

      const coreServ: CoreServices = await this.coreServicesRepo.findOne({ where: { id: core_service_id } });
      if (!coreServ) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This core service"), ResponseCodes.serverError);
      }

      const subServiceDataPromises = req.body.sub_service_data.map((item: SubServicesItem) => {
        const createdData = this.subServicesRepo.create({
          core_service: coreServ,
          sub_service_name: item.sub_service_name,
          description_title: item.description_title,
          description: item.description,
        });
        return createdData;
      });
      const data: SubServicesItem[] = await Promise.all(subServiceDataPromises);

      await this.subServicesRepo.save(data);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Sub services"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateSubServices(req: Request, res: Response) {
    try {
      const { sub_service_name, description_title, description, img_logo_url } = req.body;
      const dataId = req.params.id;
      const getData = await this.subServicesRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This sub services"), ResponseCodes.notFound);
      }
      const isExist = await this.subServicesRepo.findOne({
        where: { sub_service_name: sub_service_name, id: Not(dataId) },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This sub services data"), ResponseCodes.alreadyExist);
      }
      getData.sub_service_name = sub_service_name;
      getData.description_title = description_title;
      getData.description = description;
      getData.img_logo_url = img_logo_url;
      this.subServicesRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Sub services"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getSubServices(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const data = await this.subServicesRepo.findOne({
        where: { id: dataId },
        select: ["id", "core_service_id", "sub_service_name", "description_title", "description"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This sub services"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Sub services"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllSubServices(req: Request, res: Response) {
    try {
      const data = await this.subServicesRepo.find({
        select: ["id", "core_service_id", "sub_service_name", "description_title", "description", "updatedAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This sub services"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Sub services"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeSubServices(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const data = await this.subServicesRepo.findOne({
        where: { id: dataId },
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This sub services"), ResponseCodes.notFound);
      }
      await this.subServicesRepo.softDelete({ id: dataId });
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Sub services"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
