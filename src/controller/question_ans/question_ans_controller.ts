import { Not, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { ResponseCodes } from "../../utils/response-codes";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { QuestionAns } from "../../entities/question_ans.entity";
import { Status } from "../../utils/enum";

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
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This question and ans"), ResponseCodes.insertError);
      }

      const questionAnsData = new QuestionAns();

      questionAnsData.question = question;
      questionAnsData.answer = answer;
      await this.questionAnsRepo.save(questionAnsData);

      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Question and ans"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  };

  // edit data
  public async updateQuestionAns(req: Request, res: Response) {
    try {
      const { question, answer } = req.body;

      const dataId = parseInt(req.params.id);
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
      this.questionAnsRepo.save(getData);
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Question and ans"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getQuestionAns(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
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
      const data = await this.questionAnsRepo.find({
        where: { status: Status.ACTIVE },
        select: ["id", "question", "answer", "createdAt", "updatedAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This question and ans"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Question and ans"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // delete data
  public async removeQuestionAns(req: Request, res: Response) {
    try {
      const dataId = parseInt(req.params.id);
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
