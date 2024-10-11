import { Request, Response, Router } from "express";
import { addPortfolioValidation, pageAndSizeQueryValidation, updatePortfolioValidation } from "../utils/express_validator";
import { PortfolioController } from "../controller/portfolio/portfolio_controller";
import { verifyAdminToken } from "../utils/auth.token";

const routes = Router();
const visionExpertiesController = new PortfolioController();

routes.post("/add", verifyAdminToken, addPortfolioValidation, (req: Request, res: Response) => visionExpertiesController.addPortfolio(req, res));
routes.put("/edit/:id", verifyAdminToken, updatePortfolioValidation, (req: Request, res: Response) => visionExpertiesController.updatePortfolio(req, res));
routes.get("/get/:id", (req: Request, res: Response) => visionExpertiesController.getPortfolio(req, res));
routes.get("/get", pageAndSizeQueryValidation, (req: Request, res: Response) => visionExpertiesController.getAllPortfolio(req, res));
routes.delete("/remove/:id", verifyAdminToken, (req: Request, res: Response) => visionExpertiesController.removePortfolio(req, res));

export default routes;
