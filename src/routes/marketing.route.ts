import { Request, Response, Router } from "express";
import { addMarketingValidation } from "../utils/express_validator";
import { MarketingController } from "../controller/marketing/marketing_controller";
const routes = Router();
const marketingController = new MarketingController();

routes.post("/add", addMarketingValidation, (req: Request, res: Response) => marketingController.addMarketing(req, res));
routes.get("/get/:id", (req: Request, res: Response) => marketingController.getMarketing(req, res));
routes.get("/get", (req, res) => marketingController.getAllMarketing(req, res));

export default routes;
