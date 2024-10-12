import { FindOperator, ILike, Not, Repository } from "typeorm";
import { Status } from "../../utils/enum";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";
import { CertificationDetails } from "../../entities/certification_details.entity";
import { getPagination, getPagingData } from "../../services/paginate";

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
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This certification details"), ResponseCodes.alreadyExist);
      }

      const visionExp = new CertificationDetails();

      visionExp.sub_title = sub_title;
      visionExp.sub_description = sub_description || null;
      visionExp.logo_img_url = logo_img_url || null;

      const data = await this.certificationDetailsRepo.save(visionExp);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("Certification Details"), ResponseCodes.insertError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Certification Details"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateCertificationDetails(req: Request, res: Response) {
    try {
      const { sub_title, sub_description, logo_img_url } = req.body;

      const dataId = req.params.id;
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

      const data = await this.certificationDetailsRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("certification details"), ResponseCodes.insertError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Certification Details"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getCertificationDetails(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
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

  // get all certification details
  public async getAllCertificationDetails(req: Request, res: Response) {
    try {
      const { page = 1, size = 10, s } = req.query;

      const { limit, offset } = getPagination(parseInt(page as string, 10), parseInt(size as string, 10));

      const Dataobj: { status: Status; sub_title?: FindOperator<string> } = {
        status: Status.ACTIVE,
      };
      if (s) {
        Dataobj.sub_title = ILike(`%${s}%`);
      }

      const [data, totalItems] = await this.certificationDetailsRepo.findAndCount({
        where: Dataobj,
        select: ["id", "sub_title", "sub_description", "logo_img_url", "createdAt", "updatedAt"],
        skip: offset,
        take: limit,
      });

      const response = getPagingData({ count: totalItems, rows: data }, parseInt(page as string, 10), limit);

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Certification Details"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message || "Internal server error", ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeCertificationDetails(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
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
