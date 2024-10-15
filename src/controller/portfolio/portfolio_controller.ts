import { ILike, Not, Raw, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { Portfolio } from "../../entities/portfolio.entity";
import { getPagination, getPagingData } from "../../services/paginate";

export class PortfolioController {
  private portfolioRepo: Repository<Portfolio>;

  constructor() {
    this.portfolioRepo = AppDataSource.getRepository(Portfolio);
  }

  // add data
  public addPortfolio = async (req: Request, res: Response) => {
    try {
      const { portfolio_type_id, title, sub_title, img_url, description, live_url } = req.body;
      const getData = await this.portfolioRepo.findOne({
        where: { title: title },
      });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This portfolio"), ResponseCodes.alreadyExist);
      }

      const portfolio = new Portfolio();

      portfolio.title = title;
      portfolio.sub_title = sub_title;
      portfolio.img_url = img_url;
      portfolio.description = description;
      portfolio.live_url = live_url;
      portfolio.portfolio_type = portfolio_type_id;

      const data = await this.portfolioRepo.save(portfolio);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_SUCCESS("Portfolio"), ResponseCodes.saveError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Portfolio"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updatePortfolio(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const { title, sub_title, description, img_url, live_url } = req.body;

      const getData = await this.portfolioRepo.findOne({ where: { id: dataId }, relations: ["portfolio_type"] });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This portfolio"), ResponseCodes.notFound);
      }

      const isExist = await this.portfolioRepo.findOne({ where: { title: title, id: Not(dataId) } });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This portfolio"), ResponseCodes.alreadyExist);
      }
      getData.title = title || getData.title;
      getData.sub_title = sub_title || getData.sub_title;
      getData.description = description || getData.description;
      getData.img_url = img_url || getData.img_url;
      getData.live_url = live_url || getData.live_url;

      const data = await this.portfolioRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("Portfolio"), ResponseCodes.saveError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Portfolio"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getPortfolio(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const data = await this.portfolioRepo.findOne({
        where: { id: dataId },
        select: ["id", "title", "sub_title", "img_url", "live_url", "description", "createdAt"],
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
  public async getAllPortfolio(req: Request, res: Response) {
    try {
      const { type = "", page = 1, size = 10, s = "" } = req.query;
      const pageData: number = parseInt(page as string, 10);
      const sizeData: number = parseInt(size as string, 10);

      const { limit, offset } = getPagination(pageData, sizeData);

      let searchConditions: Array<{ [key: string]: object }> = [];
      if (s) {
        searchConditions = [{ title: ILike(`%${s}%`) }, { sub_title: ILike(`%${s}%`) }, { description: Raw((alias) => `CAST(${alias} AS TEXT) ILIKE '%${s}%'`) }];
      }

      interface WhereCondition {
        portfolio_type : {
          id:string
        }
      }
      const whereCondition: Partial<WhereCondition> = {};

      if (type) {
        whereCondition.portfolio_type = { id: type as string };
      }

      let whereQuery;
      if (searchConditions.length > 0) {
        whereQuery = searchConditions.map((condition) => ({
          ...whereCondition,
          ...condition,
        }));
      } else {
        whereQuery = whereCondition;
      }

      const [data, totalItems] = await this.portfolioRepo.findAndCount({
        where: whereQuery,
        select: ["id", "title", "sub_title", "img_url", "live_url", "description", "createdAt"],
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
  public async removePortfolio(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const getData = await this.portfolioRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This portfolio"), ResponseCodes.notFound);
      }
      const data = await this.portfolioRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This portfolio"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Portfolio"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
