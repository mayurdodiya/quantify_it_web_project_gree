import { CoreServices } from "../../entities/core_services.entity";
import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { SubServices } from "../../entities/sub_services.entity";

export class CoreServicesController {
  private coreServicesRepo: Repository<CoreServices>;
  private subServicesRepo: Repository<SubServices>;

  constructor() {
    this.coreServicesRepo = AppDataSource.getRepository(CoreServices);
    this.subServicesRepo = AppDataSource.getRepository(SubServices);
  }

  // add data
  public addData = async (req: Request, res: Response) => {
    try {
      const { img_url } = req.body;
      const service_type = req.body.service_type.toLocaleLowerCase();
      const getData = await this.coreServicesRepo.findOne({
        where: { service_type: service_type },
      });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This core services"), ResponseCodes.insertError);
      }

      const coreServ = new CoreServices();
      coreServ.service_type = service_type;
      coreServ.img_url = img_url || null;

      await this.coreServicesRepo.save(coreServ);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Core services"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateData(req: Request, res: Response) {
    try {
      const { img_url } = req.body;
      const service_type = req.body.service_type.toLocaleLowerCase();

      const dataId = parseInt(req.params.id);
      const getData = await this.coreServicesRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This core services"), ResponseCodes.notFound);
      }

      const isExist = await this.coreServicesRepo.findOne({
        where: { service_type: service_type, id: Not(dataId) },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This core services"), ResponseCodes.alreadyExist);
      }
      getData.service_type = service_type;
      getData.img_url = img_url || null;
      this.coreServicesRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Core services"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const data = await this.coreServicesRepo.findOne({
        where: { id: dataId },
        select: ["id", "service_type", "img_url", "createdAt", "updatedAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This core services"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Core services"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllData(req: Request, res: Response) {
    try {
      const data = await this.coreServicesRepo.find({
        select: ["id", "service_type", "img_url", "createdAt", "updatedAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This core services"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Core services"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const data = await this.coreServicesRepo.findOne({
        where: { id: dataId },
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This core services"), ResponseCodes.notFound);
      }
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        // execute some operations on this transaction:
        await queryRunner.manager.softDelete(CoreServices, { id: dataId });
        await queryRunner.manager.softDelete(SubServices, {
          core_service_id: dataId,
        });

        await queryRunner.commitTransaction();
        return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Core services"), ResponseCodes.success, undefined);
      } catch (error) {
        console.log(error);
        await queryRunner.rollbackTransaction();
      }
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}