import { IsNull, Repository } from "typeorm";
import { Request, Response } from "express";
import { message } from "../../utils/messages";
import { Token } from "../../entities/token.entity";
import { RoutesHandler } from "../../utils/error_handler";
import { ResponseCodes } from "../../utils/response-codes";
import { AppDataSource } from "../../config/database.config";

export class TokenController {
  private tokenRepo: Repository<Token>;

  constructor() {
    this.tokenRepo = AppDataSource.getRepository(Token);
  }

  public async getToken(req: Request, res: Response) {
    try {
      const data = await this.tokenRepo.find({
        where: {
          deletedAt: IsNull(),
        },
      });
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Token"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
