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

export class SubAdminController {
  private userRepo: Repository<User>;

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
  }

  // login admin
  public async loginSubAdmin(req: Request, res: Response) {
    try {
      console.log("------------------------------------------------------------------");

      const { email, password: pwd } = req.body;

      const getAdmin = await this.userRepo.findOne({ where: { email: email, status: Status.ACTIVE, role: Role.SUBADMIN } });

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
}
