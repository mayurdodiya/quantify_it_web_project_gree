import { Request, Response } from "express";
import { User } from "../../entities/user.entity";
import { FindOperator, ILike, Repository } from "typeorm";
import { AppDataSource } from "../../config/database.config";
import { RoutesHandler } from "../../utils/error_handler";
import { message } from "../../utils/messages";
import { ResponseCodes } from "../../utils/response-codes";
import { bcryptpassword, comparepassword } from "../../utils/bcrypt";
import { generateForgetPasswordToken, generateToken, verifyPasswordToken } from "../../utils/auth.token";
import { Role, Status } from "../../utils/enum";
import { FileService } from "../../services/file_upload";
import { networkUtils } from "../../utils/ip_address";
import { EmailService } from "../../services/nodemailer";
import logger from "../../utils/winston";
import { getPagination, getPagingData } from "../../services/paginate";
import { Permission } from "../../entities/permission.entity";

const emailService = new EmailService();
const fileService = new FileService();

export class AdminController {
  private userRepo: Repository<User>;
  private permissionRepo: Repository<Permission>;

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
    this.permissionRepo = AppDataSource.getRepository(Permission);
  }

  // login admin
  public async loginAdmin(req: Request, res: Response) {
    try {
      const { email, password: pwd } = req.body;

      const getAdmin = await this.userRepo.findOne({
        where: { email: email, status: Status.ACTIVE, role: Role.ADMIN },
      });

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

  // forgot password
  public async forgotPassword(req: Request, res: Response) {
    try {
      const { email, baseurl } = req.body;

      const getAdmin = await this.userRepo.findOne({
        where: { email: email, status: Status.ACTIVE, role: Role.ADMIN },
      });

      if (!getAdmin) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This email"), ResponseCodes.loginError);
      }

      const token = generateForgetPasswordToken(getAdmin.id, getAdmin.role);
      if (!token) {
        return RoutesHandler.sendError(req, res, false, message.NOT_GENERATE("Token"), ResponseCodes.loginError);
      }
      const url = `${baseurl}/reset-password?token=${token}&email=${email}`;
      const mailData = {
        email: getAdmin.email,
        subject: "Forgot Password",
        text: "Forgot Password",
        body: ` 
      <p>Click the button below to reset your password:</p>

      <a href="${url}" target="_blank">${url}</a>

      <p>Best regards, <br>Going Green</p>
            `,
      };

      await emailService.sendEmail(mailData.email, mailData.subject, mailData.text, mailData.body);

      return RoutesHandler.sendSuccess(req, res, true, message.FORGOT_PASSWORD_LINK, ResponseCodes.success, {});
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // set password
  public async setpassword(req: Request, res: Response) {
    try {
      // eslint-disable-next-line no-unsafe-optional-chaining
      const { token, password, confirm_password } = req?.body;

      if (!token || !password || !confirm_password) {
        return res.status(ResponseCodes.inputError).json({
          message: "token, password and confirm password are required",
        });
      }

      if (password !== confirm_password) {
        return res.status(ResponseCodes.inputError).json({ message: "Password and confirm password does not match" });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tokenResult: any = verifyPasswordToken(token);

      const getAdmin = await this.userRepo.findOne({
        where: {
          id: tokenResult?.userId,
          status: Status.ACTIVE,
          role: Role.ADMIN,
        },
      });

      if (!getAdmin) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This user"), ResponseCodes.loginError);
      }
      const hashedPassword = await bcryptpassword(password);

      getAdmin.password = hashedPassword;

      await this.userRepo
        .save(getAdmin)
        .then(() => {
          logger.info(message.FORGOT_PASSWORD_SUCCESS);
        })
        .catch((err) => {
          logger.error("Error saving admin:", err);
        });

      return RoutesHandler.sendSuccess(req, res, true, message.FORGOT_PASSWORD_SUCCESS, ResponseCodes.success, {});
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // add sub admin
  public async addSubAdmin(req: Request, res: Response) {
    try {
      const { first_name, last_name, email, phone_no, password, location } = req.body;
      const isExist = await this.userRepo.findOne({ where: { email: email } });
      if (isExist) {
        return RoutesHandler.sendError(req, res, false, message.DATA_EXIST("Email"), ResponseCodes.insertError);
      }

      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const hashedPassword = await bcryptpassword(password);

      const user = new User();
      user.first_name = first_name;
      user.last_name = last_name;
      user.email = email;
      user.phone_no = phone_no;
      user.password = hashedPassword;
      user.location = location;
      user.role = Role.SUBADMIN;
      user.status = Status.ACTIVE;

      const userPermission = new Permission();
      userPermission.user = user;

      try {
        await queryRunner.manager.save(user);
        await queryRunner.manager.save(userPermission);

        await queryRunner.commitTransaction();
        // const mailData = {
        //   email: email,
        //   subject: "Login Id Password",
        //   text: "Login Id Password",
        //   body: `
        // <p>Dear ${first_name + last_name},</p>
        // <br>
        // <p>Your profile has been added successfully by admin, your password is ${password}, do not share to anyone!</p>

        // <p>Best regards, <br>Going Green</p>
        // `,
        // };
        // var xyz = await emailService.sendEmail(mailData.email, mailData.subject, mailData.text, mailData.body);

        return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Sub admin"), ResponseCodes.createSuccess, undefined);
      } catch (err) {
        await queryRunner.rollbackTransaction();
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("Sub admin"), ResponseCodes.insertError);
      }
    } catch (error) {
      console.log(error);
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get data
  public async getSubAdmin(req: Request, res: Response) {
    try {
      const dataId = req.params.id as string;
      const data = await this.userRepo.findOne({
        where: { id: dataId, role: Role.SUBADMIN },
        select: ["id", "first_name", "last_name", "email", "phone_no", "location", "status", "role", "createdAt"],
      });
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This sub admin"), ResponseCodes.notFound);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Sub admin"), ResponseCodes.success, data);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // get all subadmin
  public async getAllSubAdmin(req: Request, res: Response) {
    try {
      const { page = 1, size = 10, s } = req.query;

      const { limit, offset } = getPagination(parseInt(page as string, 10), parseInt(size as string, 10));

      const Dataobj: [{ first_name?: FindOperator<string>; role: Role.SUBADMIN }, { last_name?: FindOperator<string>; role: Role.SUBADMIN }, { email?: FindOperator<string>; role: Role.SUBADMIN }, { phone_no?: FindOperator<string>; role: Role.SUBADMIN }] = [{ role: Role.SUBADMIN }, { role: Role.SUBADMIN }, { role: Role.SUBADMIN }, { role: Role.SUBADMIN }];
      if (s) {
        Dataobj.push({ first_name: ILike(`%${s}%`), role: Role.SUBADMIN });
        Dataobj.push({ last_name: ILike(`%${s}%`), role: Role.SUBADMIN });
        Dataobj.push({ email: ILike(`%${s}%`), role: Role.SUBADMIN });
        Dataobj.push({ phone_no: ILike(`%${s}%`), role: Role.SUBADMIN });
      }

      const [data, totalItems] = await this.userRepo.findAndCount({
        where: Dataobj,
        select: ["id", "first_name", "last_name", "email", "phone_no", "location", "status", "role", "createdAt"],
        skip: offset,
        take: limit,
      });

      const response = getPagingData({ count: totalItems, rows: data }, parseInt(page as string, 10), limit);

      return RoutesHandler.sendSuccess(req, res, true, message.GET_DATA("Sub admin"), ResponseCodes.success, response);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message || "Internal server error", ResponseCodes.serverError);
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

      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        await queryRunner.manager.softDelete(User, { id: dataId });
        await queryRunner.manager.softDelete(Permission, { user: { id: dataId } });

        await queryRunner.commitTransaction();
        return RoutesHandler.sendSuccess(req, res, true, message.DELETE_SUCCESS("Sub admin"), ResponseCodes.success, undefined);
      } catch (err) {
        await queryRunner.rollbackTransaction();
        return RoutesHandler.sendError(req, res, false, message.DELETE_FAILED("sub admin"), ResponseCodes.saveError);
      }
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // active inactive sub admin status
  public async changeSubAdminPermission(req: Request, res: Response) {
    try {
      const dataId = req.params.id as string;

      const isExist = await this.userRepo.findOne({ where: { id: dataId, role: Role.SUBADMIN } });
      if (!isExist) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This sub admin"), ResponseCodes.notFound);
      }
      var permisionData = await this.permissionRepo.findOne({ where: { user: { id: dataId } } });

      if (permisionData) {
        Object.assign(permisionData, req.body);

        const data = await this.permissionRepo.save(permisionData);
        if (!data) {
          return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("Sub admin status"), ResponseCodes.saveError);
        }

        return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Sub admin status"), ResponseCodes.success, undefined);
      } else {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This sub admin permission data"), ResponseCodes.notFound);
      }
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }

  // active inactive sub admin status
  public async changeSubAdminStatus(req: Request, res: Response) {
    try {
      const dataId = req.params.id as string;

      const isExist = await this.userRepo.findOne({ where: { id: dataId, role: Role.SUBADMIN } });
      if (!isExist) {
        return RoutesHandler.sendError(req, res, false, message.NO_DATA("This sub admin"), ResponseCodes.notFound);
      }

      isExist.status = req.body.status;
      const data = await this.userRepo.save(isExist);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.UPDATE_FAILED("Sub admin status"), ResponseCodes.saveError);
      }

      return RoutesHandler.sendSuccess(req, res, true, message.UPDATED_SUCCESSFULLY("Sub admin status"), ResponseCodes.success, undefined);
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
      const userIp = (req.headers["x-forwarded-for"] as string) || req.connection.remoteAddress;

      const ipAddress = networkUtils.getMappedIp(userIp);

      return res.send(ipAddress);
    } catch (error) {
      return RoutesHandler.sendError(req, res, false, error.message, ResponseCodes.serverError);
    }
  }
}
