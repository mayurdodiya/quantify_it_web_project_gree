import { FindOperator, ILike, Not, Repository } from "typeorm";
import { Status } from "../../utils/enum";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { HowWeWork } from "../../entities/how_we_work.entity";
import { getPagination, getPagingData } from "../../services/paginate";

export class HowWeWorkController {
  private howWeWorkRepo: Repository<HowWeWork>;

  constructor() {
    this.howWeWorkRepo = AppDataSource.getRepository(HowWeWork);
  }

  // add data
  public addHowWeWork = async (req: Request, res: Response) => {
    try {
      const { title, description, logo_img_url } = req.body;
      const getData = await this.howWeWorkRepo.findOne({
        where: { title: title },
      });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This work data"), ResponseCodes.insertError);
      }

      const questionAnsData = new HowWeWork();

      questionAnsData.title = title;
      questionAnsData.description = description;
      questionAnsData.logo_img_url = logo_img_url;

      const data = await this.howWeWorkRepo.save(questionAnsData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("work data"), ResponseCodes.insertError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Work data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateHowWeWork(req: Request, res: Response) {
    try {
      const { title, description, logo_img_url } = req.body;

      const dataId = req.params.id;
      const getData = await this.howWeWorkRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This work data"), ResponseCodes.notFound);
      }

      if (title) {
        const isExist = await this.howWeWorkRepo.findOne({ where: { title: title, id: Not(dataId) } });
        if (isExist) {
          return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This work data"), ResponseCodes.alreadyExist);
        }
      }

      getData.title = title || getData.title;
      getData.description = description || getData.description;
      getData.logo_img_url = logo_img_url || getData.logo_img_url;

      const data = await this.howWeWorkRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("work data"), ResponseCodes.saveError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Work data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getHowWeWork(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const data = await this.howWeWorkRepo.findOne({
        where: { id: dataId, status: Status.ACTIVE },
        select: ["id", "title", "description", "logo_img_url", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This work data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Work data"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllHowWeWork(req: Request, res: Response) {
    try {
      const { page = 1, size = 10, s } = req.query;

      const { limit, offset } = getPagination(parseInt(page as string, 10), parseInt(size as string, 10));

      const Dataobj: { status: Status; title?: FindOperator<string> } = {
        status: Status.ACTIVE,
      };
      if (s) {
        Dataobj.title = ILike(`%${s}%`);
      }

      const [data, totalItems] = await this.howWeWorkRepo.findAndCount({
        where: Dataobj,
        select: ["id", "title", "description", "logo_img_url", "createdAt", "updatedAt"],
        skip: offset,
        take: limit,
      });

      const response = getPagingData({ count: totalItems, rows: data }, parseInt(page as string, 10), limit);

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("How We Work data"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message || "Internal server error", ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeHowWeWork(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const getData = await this.howWeWorkRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This work data"), ResponseCodes.notFound);
      }
      const data = await this.howWeWorkRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This work data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Work data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
