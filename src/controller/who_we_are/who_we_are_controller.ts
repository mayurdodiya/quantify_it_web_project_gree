import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { WhoWeAre } from "../../entities/who_we_are.entity";

export class WhoWeAreController {
  private whoWeAreRepo: Repository<WhoWeAre>;

  constructor() {
    this.whoWeAreRepo = AppDataSource.getRepository(WhoWeAre);
  }

  // add data
  public addWhoWeAre = async (req: Request, res: Response) => {
    try {
      const { title, description, who_we_are_img_url_1, who_we_are_img_url_2, total_experience, talented_it_professionals, successfull_projects, served_country } = req.body;
      const getData = await this.whoWeAreRepo.findOne({ where: { title: title } });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This page"), ResponseCodes.alreadyExist);
      }

      const whoWeAre = new WhoWeAre();

      whoWeAre.title = title;
      whoWeAre.description = description || null;
      whoWeAre.who_we_are_img_url_1 = who_we_are_img_url_1 || null;
      whoWeAre.who_we_are_img_url_2 = who_we_are_img_url_2 || null;
      whoWeAre.total_experience = total_experience || null;
      whoWeAre.talented_it_professionals = talented_it_professionals || null;
      whoWeAre.successfull_projects = successfull_projects || null;
      whoWeAre.served_country = served_country || null;

      const data = await this.whoWeAreRepo.save(whoWeAre);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("page"), ResponseCodes.saveError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Page"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateWhoWeAre(req: Request, res: Response) {
    try {
      const { title, description, who_we_are_img_url_1, who_we_are_img_url_2, total_experience, talented_it_professionals, successfull_projects, served_country } = req.body;
      const dataId = req.params.id;

      const getData = await this.whoWeAreRepo.findOne({ where: { id: dataId } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This experties"), ResponseCodes.notFound);
      }

      if (req.body.title) {
        const isExist = await this.whoWeAreRepo.findOne({ where: { title: title, id: Not(dataId) } });
        if (isExist) {
          return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This experties"), ResponseCodes.alreadyExist);
        }
      }

      getData.title = title || getData.title;
      getData.description = description || getData.description;
      getData.who_we_are_img_url_1 = who_we_are_img_url_1 || getData.who_we_are_img_url_1;
      getData.who_we_are_img_url_2 = who_we_are_img_url_2 || getData.who_we_are_img_url_2;
      getData.total_experience = total_experience || getData.total_experience;
      getData.talented_it_professionals = talented_it_professionals || getData.talented_it_professionals;
      getData.successfull_projects = successfull_projects || getData.successfull_projects;
      getData.served_country = served_country || getData.served_country;

      const data = await this.whoWeAreRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("page"), ResponseCodes.saveError);
      }

      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Page"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getWhoWeAre(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const data = await this.whoWeAreRepo.findOne({
        where: { id: dataId },
        select: ["id", "title", "description", "who_we_are_img_url_1", "who_we_are_img_url_2", "total_experience", "talented_it_professionals", "successfull_projects", "served_country", "createdAt"],
        relations: ["certification_details"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This page"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Page"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllWhoWeAre(req: Request, res: Response) {
    try {
      const data = await this.whoWeAreRepo.find({
        select: ["id", "title", "description", "who_we_are_img_url_1", "who_we_are_img_url_2", "total_experience", "talented_it_professionals", "successfull_projects", "served_country", "createdAt"],
        relations: ["certification_details"],
      });
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Page"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeWhoWeAre(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const getData = await this.whoWeAreRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This page"), ResponseCodes.notFound);
      }
      const data = await this.whoWeAreRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This page"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Page"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }  
  
  // get Your ideas, our experience data
  public async getIdeasExperienceData(req: Request, res: Response) {
    try {
      const data = await this.whoWeAreRepo.find({
        select: ["id", "total_experience", "talented_it_professionals", "successfull_projects", "served_country", "createdAt"],
      });
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Your ideas, our experience"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
