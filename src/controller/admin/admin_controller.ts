import { Request, Response } from "express";
import { User } from "../../entities/user.entity";
import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { comparepassword } from "../../utils/bcrypt";
import { generateToken } from "../../utils/auth.token";
import { Role, Status } from "../../utils/enum";
import { FileService } from "../../services/file_upload";
import { networkUtils } from "../../utils/ip_address";

const fileService = new FileService();

export class AdminController {
  private userRepo: Repository<User>;

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
  }

  // login admin
  public async loginAdmin(req: Request, res: Response) {
    try {
      const { email, password: pwd } = req.body;

      const getAdmin = await this.userRepo.findOne({ where: { email: email, status: Status.ACTIVE, role: Role.ADMIN } });

      if (!getAdmin) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This email"), ResponseCodes.loginError);
      }

      const hashPwd = getAdmin.password;
      const adminId = getAdmin.id;

      const pwdCompair = await comparepassword(pwd, hashPwd);

      if (pwdCompair === false) {
        return RoutesHandler.sendError(req, res, false, message.NOT_MATCH("Password"), ResponseCodes.loginError);
      }
      const token = generateToken(adminId, getAdmin.role);

      if (!token) {
        return RoutesHandler.sendError(req, res, false, message.NOT_GENERATE("Token"), ResponseCodes.loginError);
      }
      const data = {
        id: getAdmin.id,
        first_name: getAdmin.first_name,
        last_name: getAdmin.last_name,
        email: getAdmin.email,
        phone_no: getAdmin.phone_no,
        status: getAdmin.status,
        role: getAdmin.role,
        location: getAdmin.location,
        token: token,
      };

      return RoutesHandler.sendSuccess(req, res, true, message.LOGIN_SUCCESS, ResponseCodes.success, data);
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

      const response = await fileService.uploadFile("images", req.file, req.file.originalname);

      return RoutesHandler.sendSuccess(req, res, true, message.UPLOAD_SUCCESS("Image"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  public async ipAddress(req: Request, res: Response) {
    try {
      let userIp = (req.headers["x-forwarded-for"] as string) || req.connection.remoteAddress;

      const ipAddress = networkUtils.getMappedIp(userIp);

      return res.send(ipAddress);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
