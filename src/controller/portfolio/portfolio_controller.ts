import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { Portfolio } from "../../entities/portfolio.entity";

export class PortfolioController {
  private portfolioRepo: Repository<Portfolio>;

  constructor() {
    this.portfolioRepo = AppDataSource.getRepository(Portfolio);
  }

  // add data
  public addPortfolio = async (req: Request, res: Response) => {
    try {
      const { type, title, sub_title, img_url, description } = req.body;
      const getData = await this.portfolioRepo.findOne({
        where: { title: title },
      });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This portfolio"), ResponseCodes.insertError);
      }

      const portfolio = new Portfolio();

      portfolio.type = type;
      portfolio.title = title;
      portfolio.sub_title = sub_title;
      portfolio.img_url = img_url || null;
      portfolio.description = description || null;
      await this.portfolioRepo.save(portfolio);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Portfolio"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updatePortfolio(req: Request, res: Response) {
    try {
      const { title, sub_title, description, img_url } = req.body;
      const type = req.body.type.toLocaleLowerCase();

      const dataId = parseInt(req.params.id);
      const getData = await this.portfolioRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This portfolio"), ResponseCodes.notFound);
      }

      const isExist = await this.portfolioRepo.findOne({
        where: { type: type, title: title, id: Not(dataId) },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This portfolio"), ResponseCodes.alreadyExist);
      }
      getData.type = type || getData.type;
      getData.title = title || getData.title;
      getData.sub_title = sub_title || getData.sub_title;
      getData.description = description || getData.description;
      getData.img_url = img_url || getData.img_url;
      this.portfolioRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Portfolio"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getPortfolio(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const data = await this.portfolioRepo.findOne({
        where: { id: dataId },
        select: ["id", "type", "title", "sub_title", "img_url", "description", "createdAt"],
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
      const { type, page, size } = req.query;
      const pageData: number = parseInt(page as string, 10);
      const sizeData: number = parseInt(size as string, 10);

      const searchType: string = type.length == 0 ? "" : `AND "type" = '${type}'`;

      const data = await AppDataSource.query(`
      SELECT
          type AS type,
          ARRAY_AGG(json_build_object('id', id, 'title', title,'sub_title', sub_title, 'img_url', img_url, 'description', description)) AS data
      FROM portfolio
      WHERE "deletedAt" IS NULL ${searchType}
      GROUP BY type
      LIMIT ${sizeData} OFFSET ${sizeData * pageData};
  `);

      const countedData = await AppDataSource.query(`
      SELECT
          type AS type,
          ARRAY_AGG(json_build_object('id', id, 'title', title,'sub_title', sub_title, 'img_url', img_url, 'description', description)) AS data
      FROM portfolio
      WHERE "deletedAt" IS NULL ${searchType}
      GROUP BY type
  `);

      const totalItems = countedData.length;

      const response = {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / sizeData),
        data,
        currentPage: pageData,
      };

      if (!data || data.length === 0) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This portfolio"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Portfolio"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removePortfolio(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
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
