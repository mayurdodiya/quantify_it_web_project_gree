import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { TrustedClients } from "../../entities/trusted_clients.entity";
import { Status } from "../../utils/enum";

export class TrustedClientsController {
  private trustedClientsRepo: Repository<TrustedClients>;

  constructor() {
    this.trustedClientsRepo = AppDataSource.getRepository(TrustedClients);
  }

  // add data
  public addData = async (req: Request, res: Response) => {
    try {
      const { client_name, his_profession, img_url, description } = req.body;
      const getData = await this.trustedClientsRepo.findOne({
        where: { client_name: client_name },
      });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This client"), ResponseCodes.insertError);
      }

      const trustedClients = new TrustedClients();

      trustedClients.client_name = client_name;
      trustedClients.his_profession = his_profession;
      trustedClients.img_url = img_url || null;
      trustedClients.description = description || null;
      await this.trustedClientsRepo.save(trustedClients);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Client"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateData(req: Request, res: Response) {
    try {
      const { client_name, his_profession, img_url, description } = req.body;

      const dataId = parseInt(req.params.id);
      const getData = await this.trustedClientsRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This client"), ResponseCodes.searchError);
      }
      const isExist = await this.trustedClientsRepo.findOne({
        where: { client_name: client_name, id: Not(dataId) },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This client"), ResponseCodes.searchError);
      }
      getData.client_name = client_name || getData.client_name;
      getData.his_profession = his_profession || getData.his_profession;
      getData.img_url = img_url || getData.img_url;
      getData.description = description || getData.description;
      this.trustedClientsRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Client"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const data = await this.trustedClientsRepo.findOne({
        where: { id: dataId, status: Status.ACTIVE },
        select: ["id", "client_name", "his_profession", "img_url", "description", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This client"), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Client"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllData(req: Request, res: Response) {
    try {
      var { page, size } = req.query;
      var pageData: number = parseInt(page as string, 10);
      var sizeData: number = parseInt(size as string, 10);

      const skipData: number = pageData * sizeData;
      const [data, totalItems] = await this.trustedClientsRepo.findAndCount({
        where: { status: Status.ACTIVE },
        select: ["id", "client_name", "his_profession", "img_url", "description", "createdAt", "createdAt"],
        skip: skipData,
        take: sizeData,
      });
      const response = {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / sizeData),
        data,
        currentPage: pageData,
      };

      if (!data || data.length === 0) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This client"), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Client"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const getData = await this.trustedClientsRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This client"), ResponseCodes.searchError);
      }
      const data = await this.trustedClientsRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This client"), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Client"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
