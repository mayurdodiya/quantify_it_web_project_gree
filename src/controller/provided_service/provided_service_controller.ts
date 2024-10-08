import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { ProvidedService } from "../../entities/provided_service.entity";
import { Status } from "../../utils/enum";

export class ProvidedServiceController {
  private providedServiceRepo: Repository<ProvidedService>;

  constructor() {
    this.providedServiceRepo = AppDataSource.getRepository(ProvidedService);
  }

  // add data
  public addProvidedService = async (req: Request, res: Response) => {
    try {
      const { card_img_url, service_type, service_name, service_name_title, description, service_benifits, work_planning_title, work_planning_description, work_planning_img_url, business_solutions_title, business_solutions_description, business_solutions_img_url, completed_works, client_ratings, bussiness_reports_percentage } = req.body;

      const serviceNameExist = await this.providedServiceRepo.findOne({
        where: { service_type: service_type, service_name: service_name },
      });
      if (serviceNameExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This service name"), ResponseCodes.insertError);
      }

      const providedServiceData = new ProvidedService();

      providedServiceData.card_img_url = card_img_url;
      providedServiceData.service_type = service_type;
      providedServiceData.service_name = service_name;
      providedServiceData.description = description;
      providedServiceData.service_name_title = service_name_title;
      providedServiceData.service_benifits = service_benifits;
      providedServiceData.work_planning_title = work_planning_title;
      providedServiceData.work_planning_description = work_planning_description;
      providedServiceData.work_planning_img_url = work_planning_img_url;
      providedServiceData.business_solutions_title = business_solutions_title;
      providedServiceData.business_solutions_description = business_solutions_description;
      providedServiceData.business_solutions_img_url = business_solutions_img_url;
      providedServiceData.completed_works = completed_works;
      providedServiceData.client_ratings = client_ratings;
      providedServiceData.bussiness_reports_percentage = bussiness_reports_percentage;

      const data = await this.providedServiceRepo.save(providedServiceData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("service provide data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Service provide data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateProvidedService(req: Request, res: Response) {
    try {
      const { card_img_url, service_type, service_name, service_name_title, description, service_benifits, work_planning_title, work_planning_description, work_planning_img_url, business_solutions_title, business_solutions_description, business_solutions_img_url, completed_works, client_ratings, bussiness_reports_percentage } = req.body;

      const dataId = req.params.id;
      const getData = await this.providedServiceRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This service provide data"), ResponseCodes.notFound);
      }

      const isExist = await this.providedServiceRepo.findOne({
        where: {
          service_type: service_type,
          service_name: service_name,
          id: Not(dataId),
        },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This service provide data"), ResponseCodes.alreadyExist);
      }

      getData.card_img_url = card_img_url || getData.card_img_url;
      getData.service_type = service_type || getData.service_type;
      getData.service_name = service_name || getData.service_name;
      getData.service_name_title = service_name_title || getData.service_name_title;
      getData.description = description || getData.description;
      getData.service_benifits = service_benifits || getData.service_benifits;
      getData.work_planning_title = work_planning_title || getData.work_planning_title;
      getData.work_planning_description = work_planning_description || getData.work_planning_description;
      getData.work_planning_img_url = work_planning_img_url || getData.work_planning_img_url;
      getData.business_solutions_title = business_solutions_title || getData.business_solutions_title;
      getData.business_solutions_description = business_solutions_description || getData.business_solutions_description;
      getData.business_solutions_img_url = business_solutions_img_url || getData.business_solutions_img_url;
      getData.completed_works = completed_works || getData.completed_works;
      getData.client_ratings = client_ratings || getData.client_ratings;
      getData.bussiness_reports_percentage = bussiness_reports_percentage || getData.bussiness_reports_percentage;

      const data = await this.providedServiceRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("service provide data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Service provide data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getProvidedService(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const data = await this.providedServiceRepo.findOne({
        where: { id: dataId, status: Status.ACTIVE },
        select: ["id", "card_img_url", "service_type", "service_name", "service_name_title", "description", "service_benifits", "work_planning_title", "work_planning_description", "work_planning_img_url", "business_solutions_title", "business_solutions_description", "business_solutions_img_url", "completed_works", "client_ratings", "bussiness_reports_percentage", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This service provide data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Service provide data"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllProvidedService(req: Request, res: Response) {
    try {
      const data = await this.providedServiceRepo.find({
        where: { status: Status.ACTIVE },
        select: ["id", "card_img_url", "service_type", "service_name", "service_name_title", "description", "service_benifits", "work_planning_title", "work_planning_description", "work_planning_img_url", "business_solutions_title", "business_solutions_description", "business_solutions_img_url", "completed_works", "client_ratings", "bussiness_reports_percentage", "createdAt", "updatedAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This service provide data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Service provide data"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeProvidedService(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const getData = await this.providedServiceRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This service provide data"), ResponseCodes.notFound);
      }
      const data = await this.providedServiceRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This service provide data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Service provide data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
