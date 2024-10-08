import { Request, Response, Router } from "express";
import { TokenController } from "../controller/token/token_controller";

const routes = Router();
const tokenController = new TokenController();

routes.get("/get", (req: Request, res: Response) => tokenController.getToken(req, res));

export default routes;
