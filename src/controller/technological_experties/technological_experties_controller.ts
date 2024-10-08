import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { TechnologicalExperties } from "../../entities/technological_experties.entity";
import { Status } from "../../utils/enum";

export class TechnologicalExpertiesController {
  private technologicalExpertiesRepo: Repository<TechnologicalExperties>;

  constructor() {
    this.technologicalExpertiesRepo = AppDataSource.getRepository(TechnologicalExperties);
  }

  // add data
  public addTechnologicalExperties = async (req: Request, res: Response) => {
    try {
      const { experties_name, img_url } = req.body;
      const experties_type = req.body.experties_type.toLocaleLowerCase();

      const isNameExist = await this.technologicalExpertiesRepo.findOne({
        where: {
          experties_name: experties_name,
          experties_type: experties_type,
        },
      });
      if (isNameExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This experties name"), ResponseCodes.insertError);
      }

      const technoExp = new TechnologicalExperties();

      technoExp.experties_type = experties_type;
      technoExp.experties_name = experties_name;
      technoExp.img_url = img_url;
      await this.technologicalExpertiesRepo.save(technoExp);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Experties"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateTechnologicalExperties(req: Request, res: Response) {
    try {
      const { experties_name, img_url } = req.body;
      const experties_type = req.body.experties_type.toLocaleLowerCase();

      const dataId = req.params.id;
      const getData = await this.technologicalExpertiesRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This experties"), ResponseCodes.notFound);
      }
      const isExist = await this.technologicalExpertiesRepo.findOne({
        where: {
          experties_type: experties_type,
          experties_name: experties_name,
          id: Not(dataId),
        },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This experties"), ResponseCodes.alreadyExist);
      }

      getData.experties_type = experties_type || getData.experties_type;
      getData.experties_name = experties_name || getData.experties_name;
      getData.img_url = img_url || getData.img_url;
      this.technologicalExpertiesRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Experties"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getTechnologicalExperties(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const data = await this.technologicalExpertiesRepo.findOne({
        where: { id: dataId, status: Status.ACTIVE },
        select: ["id", "experties_type", "experties_name", "img_url", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This experties"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Experties"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllTechnologicalExperties(req: Request, res: Response) {
    try {
      const groupedData = await AppDataSource.query(`
    SELECT
        experties_type AS experties_type,
        ARRAY_AGG(json_build_object('id', id, 'experties_name', experties_name, 'img_url', img_url)) AS data
    FROM
        technological_experties
    WHERE
        "deletedAt" IS NULL AND status = ${Status.ACTIVE}
    GROUP BY
        experties_type;
`);

      if (!groupedData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This experties"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Experties"), ResponseCodes.success, groupedData);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeTechnologicalExperties(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const isExist = await this.technologicalExpertiesRepo.findOne({
        where: { id: dataId },
      });
      if (!isExist) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This experties"), ResponseCodes.notFound);
      }

      const data = await this.technologicalExpertiesRepo.softDelete({
        id: dataId,
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This experties"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Experties"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
