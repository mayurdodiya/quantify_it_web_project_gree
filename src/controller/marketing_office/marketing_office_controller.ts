import { FindOperator, ILike, Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { getPagination, getPagingData } from "../../services/paginate";
import { MarketingOffice } from "../../entities/marketing_office.entity";

export class MarketingOfficeController {
  private marketingOfficeRepo: Repository<MarketingOffice>;

  constructor() {
    this.marketingOfficeRepo = AppDataSource.getRepository(MarketingOffice);
  }

  // add data
  public addMarketingOffice = async (req: Request, res: Response) => {
    try {
      const { office_name, address, img_url } = req.body;

      const isExist = await this.marketingOfficeRepo.findOne({ where: { office_name: office_name } });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This marketing office data"), ResponseCodes.notFound);
      }

      const marketingOfficeData = new MarketingOffice();

      marketingOfficeData.office_name = office_name;
      marketingOfficeData.address = address || null;
      marketingOfficeData.img_url = img_url || null;

      const data = await this.marketingOfficeRepo.save(marketingOfficeData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("Marketing office data"), ResponseCodes.insertError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Marketing office data"), ResponseCodes.createSuccess, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateMarketingOffice(req: Request, res: Response) {
    try {
      const { office_name, address, img_url } = req.body;

      const dataId = req.params.id;
      const getData = await this.marketingOfficeRepo.findOne({ where: { id: dataId } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This marketing office data"), ResponseCodes.notFound);
      }

      if (office_name) {
        const isExist = await this.marketingOfficeRepo.findOne({
          where: { office_name: office_name, id: Not(dataId) },
        });
        if (isExist) {
          return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This marketing office data"), ResponseCodes.alreadyExist);
        }
      }

      getData.office_name = office_name || getData.office_name;
      getData.address = address || getData.address;
      getData.img_url = img_url || getData.img_url;

      const data = await this.marketingOfficeRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("Marketing office data"), ResponseCodes.insertError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Marketing office data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getMarketingOffice(req: Request, res: Response) {
    try {
      const dataId = req.params.id as string;
      const data = await this.marketingOfficeRepo.findOne({
        where: { id: dataId },
        select: ["id", "office_name", "address", "img_url", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This marketing office data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Marketing office data"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllMarketingOffice(req: Request, res: Response) {
    try {
      const { page = 1, size = 10, s } = req.query;

      const { limit, offset } = getPagination(parseInt(page as string, 10), parseInt(size as string, 10));

      const Dataobj: { office_name?: FindOperator<string> } = {};
      if (s) {
        Dataobj.office_name = ILike(`%${s}%`);
      }

      const [data, totalItems] = await this.marketingOfficeRepo.findAndCount({
        where: Dataobj,
        select: ["id", "office_name", "address", "img_url", "createdAt"],
        skip: offset,
        take: limit,
      });

      const response = getPagingData({ count: totalItems, rows: data }, parseInt(page as string, 10), limit);

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Marketing office data"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message || "Internal server error", ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeMarketingOffice(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const getData = await this.marketingOfficeRepo.findOne({ where: { id: dataId } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This marketing office data"), ResponseCodes.notFound);
      }
      const data = await this.marketingOfficeRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This marketing office data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Marketing office data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
