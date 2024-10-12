import express, { Request, Response } from "express";
import { imageUpload } from "../services/file_upload";
import { verifyAdminToken, verifyGlobalToken } from "../utils/auth.token";
import { addUserValidation, emailValidation, loginValidation } from "../utils/express_validator";
import { AdminController } from "../controller/admin/admin_controller";

const routes = express.Router();
const adminController = new AdminController();

routes.get("/ip", (req: Request, res: Response) => adminController.ipAddress(req, res));
routes.post("/registersubadmin", verifyGlobalToken, verifyAdminToken, addUserValidation, (req: Request, res: Response) => adminController.addSubAdmin(req, res));
routes.post("/login", loginValidation, (req: Request, res: Response) => adminController.loginAdmin(req, res));
routes.post("/forgotpassword", emailValidation, (req: Request, res: Response) => adminController.forgotPassword(req, res));

routes.post("/setpassword", emailValidation, (req: Request, res: Response) => adminController.setpassword(req, res));

routes.post("/uploadimage", verifyGlobalToken, imageUpload.single("image"), (req: Request, res: Response) => adminController.uploadImage(req, res));

export default routes;
