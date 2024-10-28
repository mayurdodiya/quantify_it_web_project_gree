import { Request, Response, Router } from "express";
import { addContactUsValidation, pageAndSizeQueryValidation } from "../utils/express_validator";
import { ContactUsController } from "../controller/contact_us/contact_us_controller";
import { verifyAdminToken } from "../utils/auth.token";
const routes = Router();
const contactUsController = new ContactUsController();

routes.post("/add", addContactUsValidation, (req: Request, res: Response) => contactUsController.addContactUs(req, res));
routes.get("/get/:id", verifyAdminToken, (req: Request, res: Response) => contactUsController.getContactUs(req, res));
routes.get("/get", verifyAdminToken, pageAndSizeQueryValidation, (req: Request, res: Response) => contactUsController.getAllContactUs(req, res));

export default routes;
