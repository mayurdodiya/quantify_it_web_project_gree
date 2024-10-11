import express, { Request, Response } from "express";
import { imageUpload } from "../services/file_upload";
import { verifyGlobalToken } from "../utils/auth.token";
import { loginValidation } from "../utils/express_validator";
import { AdminController } from "../controller/admin/admin_controller";

const routes = express.Router();
const adminController = new AdminController();

routes.get("/ip", (req: Request, res: Response) => adminController.ipAddress(req, res));
routes.post("/login", loginValidation, (req: Request, res: Response) => adminController.loginAdmin(req, res));
routes.post("/uploadimage", verifyGlobalToken, imageUpload.single("image"), (req: Request, res: Response) => adminController.uploadImage(req, res));

export default routes;
