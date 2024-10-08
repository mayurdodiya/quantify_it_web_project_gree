import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
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
  public addPolicyAndTerms = async (req: Request, res: Response) => {
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

      const data = await this.policyAndTermsRepo.save(termsData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("Data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updatePolicyAndTerms(req: Request, res: Response) {
    try {
      const { subject, explanation } = req.body;
      const document_type = req.body.document_type.toLocaleLowerCase();

      const dataId = req.params.id;
      const getData = await this.policyAndTermsRepo.findOne({
        where: { id: dataId, document_type: document_type },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This data"), ResponseCodes.notFound);
      }

      const isExist = await this.policyAndTermsRepo.findOne({
        where: {
          document_type: document_type,
          subject: subject,
          id: Not(dataId),
        },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This data"), ResponseCodes.alreadyExist);
      }

      getData.document_type = document_type || getData.document_type;
      getData.subject = subject || getData.subject;
      getData.explanation = explanation || getData.explanation;

      const data = await this.policyAndTermsRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("Data"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Data"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getPolicyAndTerms(req: Request, res: Response) {
    try {
      const dataId = req.params.id;

      const data = await this.policyAndTermsRepo.findOne({
        where: { id: dataId, status: Status.ACTIVE },
        select: ["id", "document_type", "subject", "explanation", "createdAt"],
      });

      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA(`This data`), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("The requested"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllPolicyAndTerms(req: Request, res: Response) {
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
        return RoutesHandler.sendError(req, res, false, message.NO_DATA(`This data`), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("The requested"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removePolicyAndTerms(req: Request, res: Response) {
    try {
      const dataId = req.params.id;

      const getData = await this.policyAndTermsRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA(`This data`), ResponseCodes.notFound);
      }
      const data = await this.policyAndTermsRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA(`This data`), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Datas"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
