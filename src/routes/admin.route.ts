import express, { NextFunction } from "express";
import { imageUpload } from "../services/file_upload";
import { AdminController } from "../controller/admin/admin_controller";
import { imgValidation, loginValidation } from "../utils/express_validator";

const routes = express.Router();
const adminController = new AdminController();

routes.post("/login", loginValidation, (req: any, res: any) => adminController.loginAdmin(req, res));
// set validation in upload image
routes.post("/uploadimage", imageUpload.single("image"), (req: any, res: any) => adminController.uploadImage(req, res));

export default routes;
