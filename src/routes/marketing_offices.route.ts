import { Request, Response, Router } from "express";
import { addMarketingOfficeValidation, pageAndSizeQueryValidation } from "../utils/express_validator";
import { verifyAdminToken } from "../utils/auth.token";
import { MarketingOfficeController } from "../controller/marketing_office/marketing_office_controller";

const routes = Router();
const marketingOfficeController = new MarketingOfficeController();

routes.post("/add", verifyAdminToken, addMarketingOfficeValidation, (req: Request, res: Response) => marketingOfficeController.addMarketingOffice(req, res));
routes.put("/edit/:id", verifyAdminToken, (req: Request, res: Response) => marketingOfficeController.updateMarketingOffice(req, res));
routes.get("/get/:id", (req: Request, res: Response) => marketingOfficeController.getMarketingOffice(req, res));
routes.get("/get", pageAndSizeQueryValidation, (req: Request, res: Response) => marketingOfficeController.getAllMarketingOffice(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => marketingOfficeController.removeMarketingOffice(req, res));

export default routes;
