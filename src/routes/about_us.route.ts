import { Request, Response, Router } from "express";
import { addAboutUsValidation, updateAboutUsValidation } from "../utils/express_validator";
import { AboutUsController } from "../controller/about_us/about_us_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const aboutUsController = new AboutUsController();

routes.post("/add", verifyAdminToken, addAboutUsValidation, (req: Request, res: Response) => aboutUsController.addAboutUs(req, res));
routes.put("/edit", verifyAdminToken, updateAboutUsValidation, (req: Request, res: Response) => aboutUsController.updateAboutUs(req, res));
routes.get("/get", (req, res) => aboutUsController.getAboutUs(req, res));

export default routes;
