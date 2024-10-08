import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { PolicyAndTerms } from "../../entities/policy_and_terms.entity";
import { DocumentType, Status } from "../../utils/enum";

export class PolicyAndTermsController {
  private policyAndTermsRepo: Repository<PolicyAndTerms>;

  constructor() {
    this.policyAndTermsRepo = AppDataSource.getRepository(PolicyAndTerms);
  }

  // add data
  public addData = async (req: Request, res: Response) => {
    try {
      const { document_type, subject, explanation } = req.body;
      const getData = await this.policyAndTermsRepo.findOne({
        where: { subject: subject, document_type: document_type },
      });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This data"), ResponseCodes.insertError);
      }

      const termsData = new PolicyAndTerms();

      termsData.document_type = document_type === DocumentType.PRIVACY_POLICY ? DocumentType.PRIVACY_POLICY : document_type === DocumentType.TERMS_CONDITION ? DocumentType.TERMS_CONDITION : null;
      termsData.subject = subject;
      termsData.explanation = explanation;
      await this.policyAndTermsRepo.save(termsData);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateData(req: Request, res: Response) {
    try {
      const { subject, explanation } = req.body;
      const document_type = req.body.document_type.toLocaleLowerCase();

      const dataId = parseInt(req.params.id);
      const getData = await this.policyAndTermsRepo.findOne({
        where: { id: dataId, document_type: document_type },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This data"), ResponseCodes.searchError);
      }

      const isExist = await this.policyAndTermsRepo.findOne({
        where: {
          document_type: document_type,
          subject: subject,
          id: Not(dataId),
        },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This data"), ResponseCodes.searchError);
      }

      getData.document_type = document_type || getData.document_type;
      getData.subject = subject || getData.subject;
      getData.explanation = explanation || getData.explanation;
      this.policyAndTermsRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
      const docType = req.query.document_type;

      const data = await this.policyAndTermsRepo.findOne({
        where: { id: dataId, status: Status.ACTIVE },
        select: ["id", "document_type", "subject", "explanation", "createdAt"],
      });

      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA(`This data`), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("The requested"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllData(req: Request, res: Response) {
    try {
      const docTypeString = req.query.document_type as string;
      const docType = Number(docTypeString);

      const query = {
        document_type: DocumentType.PRIVACY_POLICY,
        status: Status.ACTIVE,
      };

      if (docType === DocumentType.TERMS_CONDITION) {
        query.document_type = DocumentType.TERMS_CONDITION;
      }

      const data = await this.policyAndTermsRepo.find({
        where: query,
        select: ["id", "document_type", "subject", "explanation", "createdAt", "updatedAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA(`This data`), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("The requested"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeData(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);

      const getData = await this.policyAndTermsRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA(`This data`), ResponseCodes.searchError);
      }
      const data = await this.policyAndTermsRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA(`This data`), ResponseCodes.searchError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Datas"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
