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
      const getData = await this.coreServicesRepo.findOne({ where: { service_type: service_type } });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This core services"), ResponseCodes.insertError);
      }

      const coreServ = new CoreServices();
      coreServ.service_type = service_type;
      coreServ.img_url = img_url || null;

      await this.coreServicesRepo.save(coreServ);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Core services"), ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateData(req: Request, res: Response) {
    try {
      const { img_url } = req.body;
      const service_type = req.body.service_type.toLocaleLowerCase();

      const dataId = parseInt(req.params.id);
      const getData = await this.coreServicesRepo.findOne({ where: { id: dataId } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This core services"), ResponseCodes.searchError);
      }

      const isExist = await this.coreServicesRepo.findOne({ where: { service_type: service_type, id: Not(dataId) } });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This core services"), ResponseCodes.searchError);
      }
      getData.service_type = service_type;
      getData.img_url = img_url || null;
      this.coreServicesRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Core services"), ResponseCodes.success, undefined);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const data = await this.coreServicesRepo.findOne({ where: { id: dataId }, select: ["id", "service_type", "img_url", "creadtedAt", "updatedAt"] });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This core services"), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Core services"), ResponseCodes.success, data);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllData(req: Request, res: Response) {
    try {
      const data = await this.coreServicesRepo.find({ select: ["id", "service_type", "img_url", "creadtedAt", "updatedAt"] });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This core services"), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Core services"), ResponseCodes.success, data);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const data = await this.coreServicesRepo.findOne({ where: { id: dataId } });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This core services"), ResponseCodes.searchError);
      }
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        // execute some operations on this transaction:
        await queryRunner.manager.softDelete(CoreServices, { id: dataId });
        await queryRunner.manager.softDelete(SubServices, { core_service_id: dataId });

        await queryRunner.commitTransaction();
        return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Core services"), ResponseCodes.success, undefined);
      } catch (error) {
        console.log(error);
        await queryRunner.rollbackTransaction();
      }
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  //------------------------old

  // add data old
  public addDataOLD = async (req: Request, res: Response) => {
    try {
      const { service_type, img_url } = req.body;
      const getData = await this.coreServicesRepo.findOne({ where: { service_type: service_type } });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This service type"), ResponseCodes.insertError);
      }

      const coreServ = new CoreServices();
      coreServ.service_type = service_type;
      coreServ.img_url = img_url || null;

      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        await queryRunner.manager.save(coreServ);

        for (const subServiceData of req.body.sub_services_data) {
          const subServ = new SubServices();
          subServ.sub_service_name = subServiceData.sub_service_name;
          subServ.description_title = subServiceData.description_title || null; // Handle empty title
          subServ.description = subServiceData.description;
          subServ.core_service = coreServ; // Establish the relation between core and sub-service

          await queryRunner.manager.save(subServ);
        }

        await queryRunner.commitTransaction();
        return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Core & Sub services"), ResponseCodes.success, undefined);
      } catch (error) {
        console.log(error, "------------------------------------------------- error ");
        await queryRunner.rollbackTransaction();
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("Services"), ResponseCodes.insertError);
      }
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data old
  public async updateDataOLD(req: Request, res: Response) {
    try {
      const { service_type, img_url } = req.body;
      const dataId = parseInt(req.params.id);
      const getData = await this.coreServicesRepo.findOne({ where: { id: dataId } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This services"), ResponseCodes.searchError);
      }

      getData.service_type = service_type;
      getData.img_url = img_url || null;

      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        // update core services
        await queryRunner.manager.save(getData);

        // update/create sub services
        const subServiceData = req.body.sub_services_data;
        for (let z = 0; z < subServiceData.length; z++) {
          // for update
          if (subServiceData[z].hasOwnProperty("id")) {
            const getSubServ = await this.subServicesRepo.findOne({ where: { id: subServiceData[z].id } });
            getSubServ.sub_service_name = subServiceData[z].sub_service_name;
            getSubServ.description_title = subServiceData[z].description_title;
            getSubServ.description = subServiceData[z].description;
            this.subServicesRepo.save(getSubServ); // update that data who has own property
          }

          // for new add
          if (!subServiceData[z].hasOwnProperty("id")) {
            const subServ = new SubServices();
            subServ.sub_service_name = subServiceData[z].sub_service_name;
            subServ.description_title = subServiceData[z].description_title || null;
            subServ.description = subServiceData[z].description;
            subServ.core_service = getData; // Establish the relation between core and sub-service

            await queryRunner.manager.save(subServ);
          }
        }

        await queryRunner.commitTransaction();
        return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Core & Sub services"), ResponseCodes.success, undefined);
      } catch (error) {
        console.log(error);
        await queryRunner.rollbackTransaction();
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("Services"), ResponseCodes.insertError);
      }
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
