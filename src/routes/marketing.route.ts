import { Request, Response, Router } from "express";
import { addMarketingValidation, pageAndSizeQueryValidation } from "../utils/express_validator";
import { MarketingController } from "../controller/marketing/marketing_controller";
const routes = Router();
const marketingController = new MarketingController();

routes.post("/add", addMarketingValidation, (req: Request, res: Response) => marketingController.addMarketing(req, res));
routes.get("/get/:id", (req: Request, res: Response) => marketingController.getMarketing(req, res));
routes.get("/get", pageAndSizeQueryValidation, (req: Request, res: Response) => marketingController.getAllMarketing(req, res));

export default routes;
