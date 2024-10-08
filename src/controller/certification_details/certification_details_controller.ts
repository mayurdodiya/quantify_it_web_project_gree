import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { CertificationDetails } from "../../entities/certification_details.entity";
import { Status } from "../../utils/enum";

export class CertificationDetailsController {
  private certificationDetailsRepo: Repository<CertificationDetails>;

  constructor() {
    this.certificationDetailsRepo = AppDataSource.getRepository(CertificationDetails);
  }

  // add data
  public addCertificationDetails = async (req: Request, res: Response) => {
    try {
      const { sub_title, sub_description, logo_img_url } = req.body;
      const getData = await this.certificationDetailsRepo.findOne({
        where: { sub_title: sub_title },
      });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This certification details"), ResponseCodes.insertError);
      }

      const visionExp = new CertificationDetails();

      visionExp.sub_title = sub_title;
      visionExp.sub_description = sub_description || null;
      visionExp.logo_img_url = logo_img_url || null;
      await this.certificationDetailsRepo.save(visionExp);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Certification Details"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateCertificationDetails(req: Request, res: Response) {
    try {
      const { sub_title, sub_description, logo_img_url } = req.body;

      const dataId = parseInt(req.params.id);
      const getData = await this.certificationDetailsRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This certification details"), ResponseCodes.notFound);
      }

      const isExist = await this.certificationDetailsRepo.findOne({
        where: { sub_title: sub_title, id: Not(dataId) },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This experties"), ResponseCodes.alreadyExist);
      }
      getData.sub_title = sub_title || getData.sub_title;
      getData.sub_description = sub_description || getData.sub_description;
      getData.logo_img_url = logo_img_url || getData.logo_img_url;
      this.certificationDetailsRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Certification Details"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getCertificationDetails(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const data = await this.certificationDetailsRepo.findOne({
        where: { id: dataId, status: Status.ACTIVE },
        select: ["id", "sub_title", "sub_description", "logo_img_url", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This certification details"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Certification Details"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllCertificationDetails(req: Request, res: Response) {
    try {
      const data = await this.certificationDetailsRepo.find({
        where: { status: Status.ACTIVE },
        select: ["id", "sub_title", "sub_description", "logo_img_url", "createdAt", "updatedAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This certification details"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Certification Details"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeCertificationDetails(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const getData = await this.certificationDetailsRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This certification details"), ResponseCodes.notFound);
      }
      const data = await this.certificationDetailsRepo.softDelete({
        id: dataId,
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This certification details"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Certification Details"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
