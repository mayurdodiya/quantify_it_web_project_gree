import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { AboutUs } from "../../entities/about_us.entity";

export class AboutUsController {
  private aboutUsRepo: Repository<AboutUs>;

  constructor() {
    this.aboutUsRepo = AppDataSource.getRepository(AboutUs);
  }

  // add data
  public addData = async (req: Request, res: Response) => {
    try {
      const { title, description, who_we_are_img_url_1, who_we_are_img_url_2, our_vision, our_mission, vision_mission_img_url, works_about_title, works_about_description, works_about_img_url, total_experience, talented_it_professionals, successfull_projects, served_country } = req.body;

      const getData = await this.aboutUsRepo.findOne({ where: { id: 1 } });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.ADD_ONCE("About us page"), ResponseCodes.insertError);
      }

      const aboutUsData = new AboutUs();

      aboutUsData.title = title;
      aboutUsData.description = description;
      aboutUsData.who_we_are_img_url_1 = who_we_are_img_url_1;
      aboutUsData.who_we_are_img_url_2 = who_we_are_img_url_2;
      aboutUsData.our_vision = our_vision;
      aboutUsData.our_mission = our_mission;
      aboutUsData.vision_mission_img_url = vision_mission_img_url;
      aboutUsData.works_about_title = works_about_title;
      aboutUsData.works_about_description = works_about_description;
      aboutUsData.works_about_img_url = works_about_img_url;
      aboutUsData.total_experience = total_experience;
      aboutUsData.talented_it_professionals = talented_it_professionals;
      aboutUsData.successfull_projects = successfull_projects;
      aboutUsData.served_country = served_country;
      await this.aboutUsRepo.save(aboutUsData);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("About us"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateData(req: Request, res: Response) {
    try {
      const { title, description, who_we_are_img_url_1, who_we_are_img_url_2, our_vision, our_mission, vision_mission_img_url, works_about_title, works_about_description, works_about_img_url, total_experience, talented_it_professionals, successfull_projects, served_country } = req.body;

      // const dataId = parseInt(req.params.id);
      const getData = await this.aboutUsRepo.findOne({ where: { id: 1 } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("About us page"), ResponseCodes.searchError);
      }

      getData.title = title || getData.title;
      getData.description = description || getData.description;
      getData.who_we_are_img_url_1 = who_we_are_img_url_1 || getData.who_we_are_img_url_1;
      getData.who_we_are_img_url_2 = who_we_are_img_url_2 || getData.who_we_are_img_url_2;
      getData.our_vision = our_vision || getData.our_vision;
      getData.our_mission = our_mission || getData.our_mission;
      getData.vision_mission_img_url = vision_mission_img_url || getData.vision_mission_img_url;
      getData.works_about_title = works_about_title || getData.works_about_title;
      getData.works_about_description = works_about_description || getData.works_about_description;
      getData.works_about_img_url = works_about_img_url || getData.works_about_img_url;
      getData.total_experience = total_experience || getData.total_experience;
      getData.talented_it_professionals = talented_it_professionals || getData.talented_it_professionals;
      getData.successfull_projects = successfull_projects || getData.successfull_projects;
      getData.served_country = served_country || getData.served_country;
      this.aboutUsRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("About us page"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getData(req: Request, res: Response) {
    try {
      // const dataId = parseInt(req.params.id);
      const data = await this.aboutUsRepo.findOne({ where: { id: 1 }, select: ["id", "title", "description", "who_we_are_img_url_1", "who_we_are_img_url_2", "our_vision", "our_mission", "vision_mission_img_url", "works_about_title", "works_about_description", "works_about_img_url", "total_experience", "talented_it_professionals", "successfull_projects", "served_country", "createdAt", "updatedAt"] });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("About us"), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("About us"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
