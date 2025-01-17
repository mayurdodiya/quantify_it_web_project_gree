import { FindOperator, ILike, Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { QuestionAns } from "../../entities/question_ans.entity";
import { Status } from "../../utils/enum";
import { getPagination, getPagingData } from "../../services/paginate";

export class QuestionAnsController {
  private questionAnsRepo: Repository<QuestionAns>;

  constructor() {
    this.questionAnsRepo = AppDataSource.getRepository(QuestionAns);
  }

  // add data
  public addQuestionAns = async (req: Request, res: Response) => {
    try {
      const { question, answer } = req.body;
      const getData = await this.questionAnsRepo.findOne({
        where: { question: question },
      });
      if (getData) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This question and ans"), ResponseCodes.alreadyExist);
      }

      const questionAnsData = new QuestionAns();

      questionAnsData.question = question;
      questionAnsData.answer = answer;

      const data = await this.questionAnsRepo.save(questionAnsData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("question and ans"), ResponseCodes.saveError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Question and ans"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateQuestionAns(req: Request, res: Response) {
    try {
      const { question, answer } = req.body;

      const dataId = req.params.id;
      const getData = await this.questionAnsRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This question and ans"), ResponseCodes.notFound);
      }

      const isExist = await this.questionAnsRepo.findOne({
        where: { question: question, id: Not(dataId) },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This question and ans data"), ResponseCodes.alreadyExist);
      }
      getData.question = question || getData.question;
      getData.answer = answer || getData.answer;

      const data = await this.questionAnsRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("question and ans"), ResponseCodes.saveError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Question and ans"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getQuestionAns(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const data = await this.questionAnsRepo.findOne({
        where: { id: dataId, status: Status.ACTIVE },
        select: ["id", "question", "answer", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This question and ans"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Question and ans"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all data
  public async getAllQuestionAns(req: Request, res: Response) {
    try {
      const { page = 1, size = 10, s = "" } = req.query;

      const { limit, offset } = getPagination(parseInt(page as string, 10), parseInt(size as string, 10));

      const query: { status: Status; question?: FindOperator<string> } = { status: Status.ACTIVE };

      if (s) {
        query.question = ILike(`%${s}%`);
      }
      const [data, totalItems] = await this.questionAnsRepo.findAndCount({
        where: query,
        select: ["id", "question", "answer", "createdAt", "updatedAt"],
        skip: offset,
        take: limit,
      });

      const response = getPagingData({ count: totalItems, rows: data }, parseInt(page as string, 10), limit);

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Question and answer"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message || "Internal server error", ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeQuestionAns(req: Request, res: Response) {
    try {
      const dataId = req.params.id;
      const getData = await this.questionAnsRepo.findOne({
        where: { id: dataId },
      });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This question and ans"), ResponseCodes.notFound);
      }
      const data = await this.questionAnsRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This question and ans"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Question and ans"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
