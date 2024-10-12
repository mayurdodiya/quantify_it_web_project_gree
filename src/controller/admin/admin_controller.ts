import { Request, Response } from "express";
import { User } from "../../entities/user.entity";
import { Repository } from "typeorm";
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

const emailService = new EmailService();

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

  public async setpassword(req: Request, res: Response) {
    try {
      // eslint-disable-next-line no-unsafe-optional-chaining
      const { token, password, confirmPassword } = req?.body;

      if (!token || !password || !confirmPassword) {
        return res.status(ResponseCodes.inputError).json({
          message: "token, password and confirm password are required",
        });
      }

      if (password !== confirmPassword) {
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
      
      const user = new User();
      user.first_name = first_name;
      user.last_name = last_name;
      user.email = email;
      user.phone_no = phone_no;
      user.password = password;
      user.location = location;
      user.role = Role.SUBADMIN;
      user.status = Status.ACTIVE;

      const data = await this.userRepo.save(user);
      if (!data) {
        return RoutesHandler.sendError(req, res, false, message.CREATE_FAIL("Sub admin"), ResponseCodes.insertError);
      }
      return RoutesHandler.sendSuccess(req, res, true, message.CREATE_SUCCESS("Sub admin"), ResponseCodes.createSuccess, undefined);
    } catch (error) {
      console.log(error);
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
