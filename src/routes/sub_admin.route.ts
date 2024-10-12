import express, { Request, Response } from "express";
import { loginValidation } from "../utils/express_validator";
import { SubAdminController } from "../controller/sub_admin/sub_admin_controller";

const routes = express.Router();
const subAdminController = new SubAdminController();

routes.post("/login", loginValidation, (req: Request, res: Response) => subAdminController.loginSubAdmin(req, res));

export default routes;
