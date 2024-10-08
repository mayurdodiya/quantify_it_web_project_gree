import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Role } from "./enum";
import { RoutesHandler } from "./ErrorHandler";
import { message } from "./messages";
import { ResponseCodes } from "./response-codes";

export const generateToken = (id: number, role: number) => {
  try {
    const skey = process.env.TOKEN_SECRETE_KEY;
    const tokenExp = process.env.TOKEN_EXPIRE;

    const token = jwt.sign({ id, role }, skey, { expiresIn: tokenExp });
    return token;
  } catch (error) {
    console.log("token not generated ", error.message);
    return false;
  }
};

// verify admin token
export const verifyAdminToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers["x-access-token"] as string;

    if (!token) {
      return RoutesHandler.sendError(req, res, false, message.NO_TOKEN(""), ResponseCodes.TokenError);
    }

    const sKey = process.env.TOKEN_SECRETE_KEY as string;
    const decoded = jwt.verify(token, sKey) as JwtPayload;

    if (decoded.role !== Role.ADMIN) {
      return RoutesHandler.sendError(req, res, false, message.BAD_REQUEST(""), ResponseCodes.TokenError);
    }
    return next();
  } catch (error) {
    console.log("token not match ", error.message);
    return false;
  }
};
