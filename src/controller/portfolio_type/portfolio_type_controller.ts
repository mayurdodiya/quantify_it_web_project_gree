import { ILike, Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { getPagination, getPagingData } from "../../services/paginate";
import { PortfolioType } from "../../entities/portfolio_type.entity";

export class PortfolioTypeController {
  private portfolioTypeRepo: Repository<PortfolioType>;

  constructor() {
    this.portfolioTypeRepo = AppDataSource.getRepository(PortfolioType);
  }

  // add data
  public addPortfolioType = async (req: Request, res: Response) => {
    try {
      const { type_name } = req.body;

      const getData = await this.portfolioTypeRepo.findOne({ where: { type_name: type_name } });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This portfolio type"), ResponseCodes.alreadyExist);
      }

      const portfolioType = new PortfolioType();

      portfolioType.type_name = type_name;

      const data = await this.portfolioTypeRepo.save(portfolioType);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_SUCCESS("Portfolio type"), ResponseCodes.saveError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Portfolio type"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updatePortfolioType(req: Request, res: Response) {
    try {
      const { type_name } = req.body;
      const typeName = type_name;

      const dataId = req.params.id;
      const getData = await this.portfolioTypeRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This portfolio"), ResponseCodes.notFound);
      }

      const isExist = await this.portfolioTypeRepo.findOne({ where: { type_name: typeName, id: Not(dataId) } });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This portfolio"), ResponseCodes.alreadyExist);
      }
      getData.type_name = typeName || getData.type_name;

      const data = await this.portfolioTypeRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("Portfolio"), ResponseCodes.saveError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Portfolio"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getPortfolioType(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const data = await this.portfolioTypeRepo.findOne({
        where: { id: dataId },
        select: ["id", "type_name", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This portfolio"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Portfolio"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllPortfolioType(req: Request, res: Response) {
    try {
      const { page = 1, size = 10, s = "" } = req.query;
      const pageData: number = parseInt(page as string, 10);
      const sizeData: number = parseInt(size as string, 10);

      const Dataobj: object[] = [{}];
      if (s) {
        Dataobj.push({ type_name: ILike(`%${s}%`) });
      }

      const { limit, offset } = getPagination(pageData, sizeData);

      const [data, totalItems] = await this.portfolioTypeRepo.findAndCount({
        where: Dataobj,
        select: ["id", "type_name", "createdAt"],
        skip: offset,
        take: limit,
      });

      const response = getPagingData({ count: totalItems, rows: data }, pageData, limit);

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Portfolio"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message || "Internal server error", ResponseCodes.serverError);
    }
  }

  // delete data
  public async removePortfolioType(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const getData = await this.portfolioTypeRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This portfolio"), ResponseCodes.notFound);
      }
      const data = await this.portfolioTypeRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This portfolio"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Portfolio"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
