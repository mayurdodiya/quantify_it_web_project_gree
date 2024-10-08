import { Request, Response, Router } from "express";
import { addMarketingValidation } from "../utils/express_validator";
import { MarketingController } from "../controller/marketing/marketing_controller";
const routes = Router();
const marketingController = new MarketingController();

routes.post("/add", addMarketingValidation, (req: Request, res: Response) => marketingController.addData(req, res));
routes.get("/get/:id", (req: Request, res: Response) => marketingController.getData(req, res));
routes.get("/get", (req, res) => marketingController.getAllData(req, res));

export default routes;
