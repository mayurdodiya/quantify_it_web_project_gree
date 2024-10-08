import { Request, Response } from "express";
import { User } from "../../entities/user.entity";
import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/ErrorHandler";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { comparepassword } from "../../utils/bcrypt";
import { generateToken } from "../../utils/auth.token";
import { imageUpload } from "../../services/file_upload";
import { Role, Status } from "../../utils/enum";
import path from "path";

export class AdminController {
  private userRepo: Repository<User>;

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
  }

  // login admin
  public async loginAdmin(req: Request, res: Response) {
    try {
      const { password, email } = req.body;
      const getAdmin = await this.userRepo.findOne({ where: { email: email, status: Status.ACTIVE } });
      if (!getAdmin) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This email"), ResponseCodes.loginError);
      }

      var hashPwd = getAdmin.password;
      var adminId = getAdmin.id;
      var pwdCompair = await comparepassword(password, hashPwd);
      if (pwdCompair === false) {
        return RoutesHandler.sendError(req, res, false, message.NOT_MATCH("Password"), ResponseCodes.loginError);
      }
      const token = generateToken(adminId, Role.ADMIN);
      if (!token) {
        return RoutesHandler.sendError(req, res, false, message.NOT_GENERATE("Token"), ResponseCodes.loginError);
      }

      return RoutesHandler.sendSuccess(req, res, true, message.LOGIN_SUCCESS(""), ResponseCodes.success, token);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // upload image
  public async uploadImage(req: Request, res: Response) {
    try {
      if(!req.file)
      {
        return RoutesHandler.sendError(req, res, false, message.UPLOAD_IMG("!"), ResponseCodes.insertError);
      }
      var filePath = req.file.path;
      var pathJoin = process.env.LOCAL_URL + filePath;
      console.log(pathJoin, "------------------------------------");

      req.file;
      return RoutesHandler.sendSuccess(req, res, true, message.UPLOAD_SUCCESS("Image"), ResponseCodes.success, pathJoin);
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
