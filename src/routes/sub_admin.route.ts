import express, { Request, Response } from "express";
import { loginValidation } from "../utils/express_validator";
import { SubAdminController } from "../controller/sub_admin/sub_admin_controller";
import { verifyGlobalToken, verifySubAdminToken } from "../utils/auth.token";

const routes = express.Router();
const subAdminController = new SubAdminController();

routes.post("/login", loginValidation, (req: Request, res: Response) => subAdminController.loginSubAdmin(req, res));
routes.get("/get/:id", verifySubAdminToken, (req: Request, res: Response) => subAdminController.getSubAdmin(req, res));
routes.put("/edit/:id", verifyGlobalToken, verifySubAdminToken, (req: Request, res: Response) => subAdminController.updateSubAdmin(req, res));
routes.delete("/remove/:id", verifyGlobalToken, verifySubAdminToken, (req: Request, res: Response) => subAdminController.removeSubAdmin(req, res));

export default routes;
