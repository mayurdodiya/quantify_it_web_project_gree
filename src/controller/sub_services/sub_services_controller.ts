import { CoreServices } from "../../entities/core_services.entity";
import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { SubServices } from "../../entities/sub_services.entity";

export class SubServicesController {
  private subServicesRepo: Repository<SubServices>;
  private coreServicesRepo: Repository<CoreServices>;

  constructor() {
    this.subServicesRepo = AppDataSource.getRepository(SubServices);
    this.coreServicesRepo = AppDataSource.getRepository(CoreServices);
  }

  // add data
  public addData = async (req: Request, res: Response) => {
    try {
      const { sub_service_name, core_service_id } = req.body;
      const getData = await this.subServicesRepo.findOne({ where: { sub_service_name: sub_service_name } });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This sub services"), ResponseCodes.insertError);
      }

      const coreServ = await this.coreServicesRepo.findOne({ where: { id: core_service_id } });
      if (!coreServ) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This core service"), ResponseCodes.serverError);
      }

      let data: any;
      const subServiceDataPromises = req.body.sub_service_data.map((item: any) => {
        const createdData = this.subServicesRepo.create({
          core_service: coreServ,
          sub_service_name: item.sub_service_name,
          description_title: item.description_title,
          description: item.description,
        });
        return createdData;
      });
      data = await Promise.all(subServiceDataPromises);

      await this.subServicesRepo.save(data);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Sub services"), ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateData(req: Request, res: Response) {
    try {
      const { sub_service_name, description_title, description, img_logo_url } = req.body;
      const dataId = parseInt(req.params.id);
      const getData = await this.subServicesRepo.findOne({ where: { id: dataId } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This sub services"), ResponseCodes.searchError);
      }
      const isExist = await this.subServicesRepo.findOne({ where: { sub_service_name: sub_service_name, id: Not(dataId) } });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This sub services data"), ResponseCodes.searchError);
      }
      getData.sub_service_name = sub_service_name;
      getData.description_title = description_title;
      getData.description = description;
      this.subServicesRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Sub services"), ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const data = await this.subServicesRepo.findOne({ where: { id: dataId }, select: ["id", "core_service_id", "sub_service_name", "description_title", "description"] });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This sub services"), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Sub services"), ResponseCodes.success, data);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllData(req: Request, res: Response) {
    try {
      const data = await this.subServicesRepo.find({ select: ["id", "core_service_id", "sub_service_name", "description_title", "description", "updatedAt"] });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This sub services"), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Sub services"), ResponseCodes.success, data);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const data = await this.subServicesRepo.findOne({ where: { id: dataId } });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This sub services"), ResponseCodes.searchError);
      }
      const removeData = await this.subServicesRepo.softDelete({ id: dataId });
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Sub services"), ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
