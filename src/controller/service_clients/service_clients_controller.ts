import { FindOperator, ILike, Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { Status } from "../../utils/enum";
import { getPagination } from "../../services/paginate";
import { ServiceClients } from "../../entities/service_clients.entity";

export class ServiceClientsController {
  private serviceClientsRepo: Repository<ServiceClients>;

  constructor() {
    this.serviceClientsRepo = AppDataSource.getRepository(ServiceClients);
  }

  // add data
  public addServiceClients = async (req: Request, res: Response) => {
    try {
      const { client_name, his_profession, img_url, description, rating } = req.body;

      const getData = await this.serviceClientsRepo.findOne({ where: { client_name: client_name } });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This client"), ResponseCodes.alreadyExist);
      }

      const serviceClients = new ServiceClients();

      serviceClients.client_name = client_name;
      serviceClients.his_profession = his_profession;
      serviceClients.img_url = img_url;
      serviceClients.description = description;
      serviceClients.rating = rating;

      const data = await this.serviceClientsRepo.save(serviceClients);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("client"), ResponseCodes.saveError);
      }

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Client"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateServiceClients(req: Request, res: Response) {
    try {
      const { client_name, his_profession, img_url, description, rating } = req.body;

      const dataId = req.params.id;
      const getData = await this.serviceClientsRepo.findOne({ where: { id: dataId } });

      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This client"), ResponseCodes.notFound);
      }

      const isExist = await this.serviceClientsRepo.findOne({ where: { client_name: client_name, id: Not(dataId) } });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This client"), ResponseCodes.alreadyExist);
      }

      getData.client_name = client_name || getData.client_name;
      getData.his_profession = his_profession || getData.his_profession;
      getData.img_url = img_url || getData.img_url;
      getData.description = description || getData.description;
      getData.rating = rating || getData.rating;

      const data = await this.serviceClientsRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("client"), ResponseCodes.saveError);
      }

      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Client"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data by id
  public async getServiceClients(req: Request, res: Response) {
    try {
      const dataId = req.params.id;

      const data = await this.serviceClientsRepo.findOne({ where: { id: dataId, status: Status.ACTIVE }, select: ["id", "client_name", "his_profession", "img_url", "description", "rating", "createdAt"] });

      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This client"), ResponseCodes.notFound);
      }

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Client"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllServiceClients(req: Request, res: Response) {
    try {
      const { page = 1, size = 10, s = "" } = req.query;
      const pageData: number = parseInt(page as string, 10);
      const sizeData: number = parseInt(size as string, 10);
      const { limit, offset } = getPagination(pageData, sizeData);

      const Dataobj: [{ client_name?: FindOperator<string>; status: Status.ACTIVE }, { his_profession?: FindOperator<string>; status: Status.ACTIVE }] = [{ status: Status.ACTIVE }, { status: Status.ACTIVE }];
      if (s) {
        Dataobj.push({ client_name: ILike(`%${s}%`), status: Status.ACTIVE });
        Dataobj.push({ his_profession: ILike(`%${s}%`), status: Status.ACTIVE });
      }

      const [data, totalItems] = await this.serviceClientsRepo.findAndCount({
        where: Dataobj,
        select: ["id", "client_name", "his_profession", "img_url", "description", "rating", "status", "createdAt"],
        skip: offset,
        take: limit,
      });

      const response = {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / sizeData),
        data,
        currentPage: pageData,
      };

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Client"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeServiceClients(req: Request, res: Response) {
    try {
      const dataId = req.params.id;

      const getData = await this.serviceClientsRepo.findOne({ where: { id: dataId } });

      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This client"), ResponseCodes.notFound);
      }

      const data = await this.serviceClientsRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This client"), ResponseCodes.notFound);
      }

      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Client"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
