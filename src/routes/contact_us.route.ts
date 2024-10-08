import { Request, Response, Router } from "express";
import { addContactUsValidation } from "../utils/express_validator";
import { ContactUsController } from "../controller/contact_us/contact_us_controller";
const routes = Router();
const contactUsController = new ContactUsController();

routes.post("/add", addContactUsValidation, (req: Request, res: Response) => contactUsController.addContactUs(req, res));
routes.get("/get/:id", (req: Request, res: Response) => contactUsController.getContactUs(req, res));
routes.get("/get", (req, res) => contactUsController.getAllContactUs(req, res));

export default routes;
