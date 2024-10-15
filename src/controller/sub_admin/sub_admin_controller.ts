import { Request, Response } from "express";
import { User } from "../../entities/user.entity";
import { Not, Repository } from "typeorm";
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

  // login sub admin
  public async loginSubAdmin(req: Request, res: Response) {
    try {
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

  // get sub admin by id
  public async getSubAdmin(req: Request, res: Response) {
    try {
      const dataId = req.params.id as string;
      const data = await this.userRepo.findOne({
        where: { id: dataId, status: Status.ACTIVE },
        select: ["id", "first_name", "last_name", "email", "phone_no", "location", "status", "role", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("Sub admin"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Sub admin"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // edit data
  public async updateSubAdmin(req: Request, res: Response) {
    try {
      const { first_name, last_name, email, phone_no } = req.body;

      const dataId = req.params.id;
      const getData = await this.userRepo.findOne({ where: { id: dataId } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This user"), ResponseCodes.notFound);
      }

      const isExist = await this.userRepo.findOne({
        where: { email: email, id: Not(dataId) },
      });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("This email"), ResponseCodes.alreadyExist);
      }

      getData.first_name = first_name || getData.first_name;
      getData.last_name = last_name || getData.last_name;
      getData.email = email || getData.email;
      getData.phone_no = phone_no || getData.phone_no;

      const data = await this.userRepo.save(getData);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("your profile"), ResponseCodes.insertError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Your profile"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // remove subadmin by id
  public async removeSubAdmin(req: Request, res: Response) {
    try {
      const dataId = req.params.id as string;
      const getData = await this.userRepo.findOne({ where: { id: dataId, role: Role.SUBADMIN } });
      if (!getData) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This sub admin"), ResponseCodes.notFound);
      }

      const data = await this.userRepo.softDelete({ id: dataId });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.DELETE_FAILED("sub admin"), ResponseCodes.saveError);
      }

      return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Sub admin"), ResponseCodes.success, undefined);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
