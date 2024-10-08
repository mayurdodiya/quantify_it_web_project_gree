import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Role } from "./enum";
import { RoutesHandler } from "./error_handler";
import { message } from "./messages";
import { ResponseCodes } from "./response-codes";
import { Token } from "../entities/token.entity";
import { AppDataSource } from "../config/database.config";

export const generateToken = (id: string, role: number) => {
  try {
    const skey = process.env.TOKEN_SECRETE_KEY;
    const tokenExp = process.env.TOKEN_EXPIRE;

    const token = jwt.sign({ id, role }, skey, { expiresIn: tokenExp });
    return token;
  } catch (error) {
    console.log("token not generated ", error.message);
  }
};

// verify admin token
export const verifyAdminToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers["x-access-token"] as string;

    if (!token) {
      return RoutesHandler.sendError(req, res, false, message.NO_TOKEN, ResponseCodes.TokenError);
    }

    const sKey = process.env.TOKEN_SECRETE_KEY as string;
    const decoded = jwt.verify(token, sKey) as JwtPayload;

    if (decoded.role !== Role.ADMIN) {
      return RoutesHandler.sendError(req, res, false, message.BAD_REQUEST, ResponseCodes.TokenError);
    }
    return next();
  } catch (error) {
    console.log("token not match ", error.message);
    return false;
  }
};

export const verifyGlobalToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token2 = req.headers["authorization"] as string;

    if (!token2) {
      return RoutesHandler.sendError(req, res, false, message.NO_TOKEN, ResponseCodes.TokenError);
    }

    const token_2 = token2?.split(" ")[1];

    const tokenRepo = AppDataSource.getRepository(Token);
    const tokenData = await tokenRepo.findOne({ where: { token: token_2 } });

    if (!tokenData) {
      return RoutesHandler.sendError(req, res, false, message.BAD_REQUEST, ResponseCodes.TokenError);
    }
    return next();
  } catch (error) {
    console.log("token not match ", error.message);
    return false;
  }
};
