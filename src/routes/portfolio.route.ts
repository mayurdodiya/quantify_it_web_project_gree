import { Request, Response, Router } from "express";
import { addPortfolioValidation, portfolioQueryValidation, updatePortfolioValidation } from "../utils/express_validator";
import { PortfolioController } from "../controller/portfolio/portfolio_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const visionExpertiesController = new PortfolioController();

routes.post("/add",verifyAdminToken, addPortfolioValidation, (req: Request, res: Response) => visionExpertiesController.addData(req, res));
routes.put("/edit/:id",verifyAdminToken, updatePortfolioValidation, (req: any, res: any) => visionExpertiesController.updateData(req, res));
routes.get("/get/:id", (req: any, res: any) => visionExpertiesController.getData(req, res));
routes.get("/get", portfolioQueryValidation, (req: any, res: any) => visionExpertiesController.getAllData(req, res));
routes.delete("/remove/:id",verifyAdminToken, (req: any, res: any) => visionExpertiesController.removeData(req, res));

export default routes;
