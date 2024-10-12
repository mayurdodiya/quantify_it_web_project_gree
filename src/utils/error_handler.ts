import * as express from "express";
import logger from "./winston";
import { ResponseCodes } from "./response-codes";

export class RoutesHandler {
  public static async respond(
    req: express.Request,
    res: express.Response,
    error: boolean,
    message: string,
    code: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: any
  ) {
    if (req.get("origin")) res.set("Access-Control-Allow-Origin", req.get("origin"));
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.status(code);
    res.json({ success: error, message: message, data: values });
  }

  public static sendSuccess(
    req: express.Request,
    res: express.Response,
    error: boolean,
    message: string,
    code: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ) {
    logger.info(message);
    this.respond(req, res, true, message, code, data);
  }

  public static sendError(req: express.Request, res: express.Response, error: boolean, message: string, code: number) {
    if (code === ResponseCodes.serverError) {
      logger.error(message);
    } else {
      logger.warn(message);
    }
    this.respond(req, res, error, message, code, undefined);
  }
}
