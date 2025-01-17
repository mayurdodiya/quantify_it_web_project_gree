import { FindOperator, ILike, Repository } from "typeorm";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { Marketing } from "../../entities/marketing.entity";
import { AppDataSource } from "../../config/database.config";
import { getPagination } from "../../services/paginate";
import { MarketingUser } from '../../services/EmailCompile/marketing';

export class MarketingController {
  private marketingRepo: Repository<Marketing>;

  constructor() {
    this.marketingRepo = AppDataSource.getRepository(Marketing);
  }

  // add data
  public addMarketing = async (req: Request, res: Response) => {
    try {
      const { marketing_type, referred_by, business_stage, full_name, email, location, company_name, user_message } = req.body;
      const marketing = new Marketing();

      marketing.marketing_type = marketing_type;
      marketing.referred_by = referred_by;
      marketing.business_stage = business_stage;
      marketing.full_name = full_name;
      marketing.email = email;
      marketing.location = location;
      marketing.company_name = company_name;
      marketing.user_message = user_message;

      const data = await this.marketingRepo.save(marketing);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("form data"), ResponseCodes.saveError);
      }

      await MarketingUser(email, "Thank You! Your Form Has Been Submitted!", full_name)

      return RoutesHandler.sendSuccess(req, res, true, message.SUBMIT_FORM, ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // get data
  public async getMarketing(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const data = await this.marketingRepo.findOne({
        where: { id: dataId },
        select: ["id", "marketing_type", "referred_by", "business_stage", "full_name", "email", "location", "company_name", "user_message", "createdAt", "updatedAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Marketing forms"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllMarketing(req: Request, res: Response) {
    try {
      const { page = 1, size = 10, s = "" } = req.query;
      const pageData: number = parseInt(page as string, 10);
      const sizeData: number = parseInt(size as string, 10);
      const { limit, offset } = getPagination(pageData, sizeData);

      const searchConditions: [{ full_name?: FindOperator<string> }, { email?: FindOperator<string> }, { company_name?: FindOperator<string> }] = [{}, {}, {}];
      if (s) {
        searchConditions.push({ full_name: ILike(`%${s}%`) });
        searchConditions.push({ email: ILike(`%${s}%`) });
        searchConditions.push({ company_name: ILike(`%${s}%`) });
      }

      const [data, totalItems] = await this.marketingRepo.findAndCount({
        where: searchConditions,
        select: ["id", "marketing_type", "referred_by", "business_stage", "full_name", "email", "location", "company_name", "user_message", "createdAt"],
        skip: offset,
        take: limit,
      });

      const response = {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / sizeData),
        data,
        currentPage: pageData,
      };

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Marketing forms"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message || "Internal server error", ResponseCodes.serverError);
    }
  }
}
