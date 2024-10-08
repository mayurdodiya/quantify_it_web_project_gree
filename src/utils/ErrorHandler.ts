import * as express from "express";

export class RoutesHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static async respond(req: express.Request, res: express.Response, error: boolean, message: string, code: number, values: any) {
    if (req.get("origin")) res.set("Access-Control-Allow-Origin", req.get("origin"));
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.status(code);
    res.json({ success: error, message: message, data: values });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static sendSuccess(req: express.Request, res: express.Response, error: boolean, message: string, code: number, data: any) {
    this.respond(req, res, true, message, code, data);
  }
  public static sendError(req: express.Request, res: express.Response, error: boolean, message: string, code: number) {
    this.respond(req, res, error, message, code, undefined);
  }
}
