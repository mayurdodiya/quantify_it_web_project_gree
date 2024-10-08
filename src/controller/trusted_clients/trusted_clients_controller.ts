import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
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
  public addTrustedClients = async (req: Request, res: Response) => {
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

      const data = await this.trustedClientsRepo.save(trustedClients);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("client"), ResponseCodes.inputError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Client"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateTrustedClients(req: Request, res: Response) {
    try {
      const { client_name, his_profession, img_url, description } = req.body;

      const dataId = req.params.id;
      const getData = await this.trustedClientsRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This client"), ResponseCodes.notFound);
      }
      const isExist = await this.trustedClientsRepo.findOne({
        where: { client_name: client_name, id: Not(dataId) },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This client"), ResponseCodes.alreadyExist);
      }
      getData.client_name = client_name || getData.client_name;
      getData.his_profession = his_profession || getData.his_profession;
      getData.img_url = img_url || getData.img_url;
      getData.description = description || getData.description;

      const data = await this.trustedClientsRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("client"), ResponseCodes.inputError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Client"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getTrustedClients(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const data = await this.trustedClientsRepo.findOne({
        where: { id: dataId, status: Status.ACTIVE },
        select: ["id", "client_name", "his_profession", "img_url", "description", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This client"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Client"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllTrustedClients(req: Request, res: Response) {
    try {
      const { page, size } = req.query;
      const pageData: number = parseInt(page as string, 10);
      const sizeData: number = parseInt(size as string, 10);

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
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This client"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Client"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeTrustedClients(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const getData = await this.trustedClientsRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This client"), ResponseCodes.notFound);
      }
      const data = await this.trustedClientsRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This client"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Client"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
