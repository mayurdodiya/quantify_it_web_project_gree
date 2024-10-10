import { Request, Response, Router } from "express";
import { verifyAdminToken } from "../utils/auth.token";
import { AboutUsController } from "../controller/about_us/about_us_controller";
import { addAboutUsValidation, updateAboutUsValidation } from "../utils/express_validator";

const routes = Router();
const aboutUsController = new AboutUsController();

routes.get("/get", (req, res) => aboutUsController.getAboutUs(req, res));
routes.post("/add", verifyAdminToken, addAboutUsValidation, (req: Request, res: Response) => aboutUsController.addAboutUs(req, res));
routes.put("/edit/:id", verifyAdminToken, updateAboutUsValidation, (req: Request, res: Response) => aboutUsController.updateAboutUs(req, res));

export default routes;
