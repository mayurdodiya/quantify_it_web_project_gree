import { Request, Response } from "express";
import { User } from "../../entities/user.entity";
import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { comparepassword } from "../../utils/bcrypt";
import { generateToken } from "../../utils/auth.token";
import {  Status } from "../../utils/enum";

export class AdminController {
  private userRepo: Repository<User>;

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
  }

  // login admin
  public async loginAdmin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const getAdmin = await this.userRepo.findOne({
        where: { email: email, status: Status.ACTIVE },
      });

      if (!getAdmin) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This email"), ResponseCodes.loginError);
      }

      const hashPwd = getAdmin.password;
      const adminId = getAdmin.id;

      const pwdCompair = await comparepassword(password, hashPwd);

      if (pwdCompair === false) {
        return RoutesHandler.sendError(req, res, false, message.NOT_MATCH("Password"), ResponseCodes.loginError);
      }
      const token = generateToken(adminId, getAdmin.role);

      if (!token) {
        return RoutesHandler.sendError(req, res, false, message.NOT_GENERATE("Token"), ResponseCodes.loginError);
      }

      return RoutesHandler.sendSuccess(req, res, true, message.LOGIN_SUCCESS, ResponseCodes.success, token);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // upload image
  public async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return RoutesHandler.sendError(req, res, false, message.UPLOAD_IMG, ResponseCodes.insertError);
      }
      const filePath = req.file.path;
      const pathJoin = process.env.LOCAL_URL + filePath;
      console.log(pathJoin, "------------------------------------");

      return RoutesHandler.sendSuccess(req, res, true, message.UPLOAD_SUCCESS("Image"), ResponseCodes.success, pathJoin);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
