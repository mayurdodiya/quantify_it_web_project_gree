import { Request, Response } from "express";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { ResponseCodes } from "../../utils/response-codes";
import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { message } from "../../utils/messages";
import { Banner } from "../../entities/banner.entity";

export class BannerController {
  private bannerRepo: Repository<Banner>;

  constructor() {
    this.bannerRepo = AppDataSource.getRepository(Banner);
  }

  // add banner
  public async createBanner(req: Request, res: Response) {
    try {
      const { banner_name, pc_img_url, mobile_img_url, title, description } = req.body;
      const findBanner = await this.bannerRepo.findOne({
        where: { banner_name: banner_name },
      });

      if (findBanner) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("Banner name"), ResponseCodes.insertError);
      }

      const banner = new Banner();
      banner.title = title;
      banner.description = description || null;
      banner.banner_name = banner_name;
      banner.pc_img_url = pc_img_url || null;
      banner.mobile_img_url = mobile_img_url || null;

      const savedBanner = await this.bannerRepo.save(banner);
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Banner"), ResponseCodes.success, savedBanner);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // edit banner
  public async updateBanner(req: Request, res: Response) {
    try {
      const { banner_name, pc_img_url, mobile_img_url, title, description } = req.body;

      const bannerId = parseInt(req.params.id);
      const banner = await this.bannerRepo.findOne({ where: { id: bannerId } });
      if (!banner) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This banner"), ResponseCodes.notFound);
      }
      banner.title = title || banner.title;
      banner.description = description || banner.description;
      banner.banner_name = banner_name;
      banner.pc_img_url = pc_img_url || banner.pc_img_url;
      banner.mobile_img_url = mobile_img_url || banner.mobile_img_url;

      this.bannerRepo.save(banner);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Banner"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get banner
  public async getBanner(req: Request, res: Response) {
    try {
      const bannerId = parseInt(req.params.id);
      const banner = await this.bannerRepo.findOne({ where: { id: bannerId } });
      if (!banner) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This banner"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Banner"), ResponseCodes.success, banner);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const data = await this.bannerRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This banner"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Banner"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}