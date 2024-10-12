import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Role } from "./enum";
import { RoutesHandler } from "./error_handler";
import { message } from "./messages";
import { ResponseCodes } from "./response-codes";
import { Token } from "../entities/token.entity";
import { AppDataSource } from "../config/database.config";
import logger from "./winston";
import token from "../config/variables/token.json";
const tokenConfigurations = token;

export const generateToken = (id: string, role: number) => {
  try {
    const skey = tokenConfigurations.TOKEN_SECRETE_KEY;
    const tokenExp = tokenConfigurations.TOKEN_EXPIRE;

    const token = jwt.sign({ id, role }, skey, { expiresIn: tokenExp });
    return token;
  } catch (error) {
    logger.error("token not generated ", error.message);
  }
};

// generateForgetPasswordToken(userId: any): string {
//   const token = jwt.sign({ userId }, this.secretKey, { expiresIn: '5m' });
//   return token;
// }

export const generateForgetPasswordToken = (userId: string, role: number) => {
  try {
    const skey = tokenConfigurations.TOKEN_SECRETE_KEY;
    const tokenExp = tokenConfigurations.FORGET_PASSWORD_TOKEN_EXPIRE;

    const token = jwt.sign({ userId, role }, skey, { expiresIn: tokenExp });
    return token;
  } catch (error) {
    logger.error("token not generated ", error.message);
  }
};

export const verifyPasswordToken = async (token: string) => {
  try {
    if (!token) {
      logger.error("token not found");
      return;
    }

    const sKey = tokenConfigurations.TOKEN_SECRETE_KEY as string;
    const decoded = jwt.verify(token, sKey) as JwtPayload;

    return decoded;
  } catch (error) {
    logger.error("token not match ", error.message);
  }
};

// verify admin token
export const verifyAdminToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers["x-access-token"] as string;

    if (!token) {
      return RoutesHandler.sendError(req, res, false, message.NO_TOKEN, ResponseCodes.tokenError);
    }

    const sKey = tokenConfigurations.TOKEN_SECRETE_KEY as string;
    const decoded = jwt.verify(token, sKey) as JwtPayload;

    if (decoded.role !== Role.ADMIN) {
      return RoutesHandler.sendError(req, res, false, message.BAD_REQUEST, ResponseCodes.tokenError);
    }
    return next();
  } catch (error) {
    logger.error("token not match ", error.message);
    return RoutesHandler.sendError(req, res, false, message.TOKEN_EXPIRED, ResponseCodes.tokenError);
  }
};

export const verifyGlobalToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token2 = req.headers["authorization"] as string;

    if (!token2) {
      return RoutesHandler.sendError(req, res, false, message.NO_TOKEN, ResponseCodes.tokenError);
    }

    const token_2 = token2?.split(" ")[1];

    const tokenRepo = AppDataSource.getRepository(Token);
    const tokenData = await tokenRepo.findOne({ where: { token: token_2 } });

    if (!tokenData) {
      return RoutesHandler.sendError(req, res, false, message.BAD_REQUEST, ResponseCodes.tokenError);
    }
    return next();
  } catch (error) {
    logger.error("token not match ", error.message);
    return false;
  }
};
