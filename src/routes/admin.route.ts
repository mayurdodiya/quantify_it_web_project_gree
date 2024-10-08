import express, { Request, Response } from "express";
import { imageUpload } from "../services/file_upload";
import { AdminController } from "../controller/admin/admin_controller";
import { loginValidation } from "../utils/express_validator";

const routes = express.Router();
const adminController = new AdminController();

routes.post("/login", loginValidation, (req: Request, res: Response) => adminController.loginAdmin(req, res));
routes.post("/uploadimage", imageUpload.single("image"), (req: Request, res: Response) => adminController.uploadImage(req, res));

export default routes;
